"""
Authorization Service
Handles role-based access control and permission checking
"""

from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import logging
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()
security = HTTPBearer()


class AuthorizationService:
    """Service for handling authorization and permissions"""
    
    # Role hierarchy - higher numbers have more privileges
    ROLE_HIERARCHY = {
        "user": 1,
        "moderator": 2,
        "admin": 3,
        "super_admin": 4
    }
    
    # Permission mappings
    ROLE_PERMISSIONS = {
        "user": ["read:own_data", "create:answers", "read:questions"],
        "moderator": ["user", "read:all_data", "update:answers", "delete:own_content"],
        "admin": ["moderator", "create:users", "update:users", "delete:users", "manage:settings"],
        "super_admin": ["admin", "manage:system", "read:logs", "manage:api_keys"]
    }
    
    @classmethod
    def check_role_permission(cls, user_role: str, required_permission: str) -> bool:
        """
        Check if user role has the required permission
        
        Args:
            user_role: The role of the user
            required_permission: The permission required to access the resource
            
        Returns:
            bool: True if user has permission, False otherwise
        """
        if not user_role or not required_permission:
            return False
        
        user_role = user_role.lower()
        
        # Check if role exists in hierarchy
        if user_role not in cls.ROLE_HIERARCHY:
            logger.warning(f"Unknown role: {user_role}")
            return False
        
        # Get all permissions for this role (including inherited permissions)
        user_permissions = set()
        current_role = user_role
        
        while current_role in cls.ROLE_PERMISSIONS:
            permissions = cls.ROLE_PERMISSIONS[current_role]
            for perm in permissions:
                if perm in cls.ROLE_HIERARCHY:
                    # This is a role reference, add its permissions
                    user_permissions.update(cls.ROLE_PERMISSIONS[perm])
                else:
                    # This is a direct permission
                    user_permissions.add(perm)
            
            # Move up the hierarchy
            if current_role in cls.ROLE_PERMISSIONS and cls.ROLE_PERMISSIONS[current_role][0] in cls.ROLE_HIERARCHY:
                current_role = cls.ROLE_PERMISSIONS[current_role][0]
            else:
                break
        
        return required_permission in user_permissions
    
    @classmethod
    def check_role_hierarchy(cls, user_role: str, required_role: str) -> bool:
        """
        Check if user role has equal or higher hierarchy than required role
        
        Args:
            user_role: The role of the user
            required_role: The minimum role required
            
        Returns:
            bool: True if user has sufficient role level
        """
        if not user_role or not required_role:
            return False
        
        user_role = user_role.lower()
        required_role = required_role.lower()
        
        user_level = cls.ROLE_HIERARCHY.get(user_role, 0)
        required_level = cls.ROLE_HIERARCHY.get(required_role, 0)
        
        return user_level >= required_level
    
    @classmethod
    def verify_api_key(cls, api_key: str) -> bool:
        """
        Verify API key for internal services
        
        Args:
            api_key: The API key to verify
            
        Returns:
            bool: True if API key is valid
        """
        if not api_key:
            return False
        return api_key == settings.internal_api_key
    
    @classmethod
    def log_security_event(cls, event_type: str, user_id: str = None, 
                          details: str = None, ip_address: str = None, 
                          request: Request = None):
        """
        Log security events for audit purposes
        
        Args:
            event_type: Type of security event
            user_id: User identifier if applicable
            details: Additional details about the event
            ip_address: IP address of the requester
            request: FastAPI request object for additional context
        """
        log_message = f"Security Event: {event_type}"
        if user_id:
            log_message += f" | User: {user_id}"
        if details:
            log_message += f" | Details: {details}"
        if ip_address:
            log_message += f" | IP: {ip_address}"
        
        # Add request information if available
        if request:
            log_message += f" | User-Agent: {request.headers.get('user-agent', 'Unknown')}"
            log_message += f" | Path: {request.url.path}"
        
        logger.warning(log_message)


# Dependency functions for FastAPI routes
async def get_current_user_with_permissions(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    request: Request = None
) -> Dict[str, Any]:
    """
    Get current user and validate token
    Returns user information including role and permissions
    """
    from app.services.auth_service import verify_token
    
    token = credentials.credentials
    payload = verify_token(token)
    
    if payload is None:
        AuthorizationService.log_security_event(
            "INVALID_TOKEN", 
            ip_address=request.client.host if request else None,
            request=request
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_login = payload.get("sub")
    if user_login is None:
        AuthorizationService.log_security_event(
            "MISSING_USER_CLAIM",
            ip_address=request.client.host if request else None,
            request=request
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return {
        "user_login": user_login,
        "token": token,
        "payload": payload
    }


def require_permission(permission: str):
    """
    Dependency factory to require specific permission
    """
    async def permission_dependency(
        user_info: Dict[str, Any] = Depends(get_current_user_with_permissions),
        request: Request = None
    ):
        # Get user role from database (this would be implemented with actual DB call)
        from app.db.database import get_db
        from app.db import models
        
        # For now, we'll get the role from the token payload
        # In a real implementation, you'd fetch the user from DB
        user_role = user_info.get("payload", {}).get("role", "user")
        
        if not AuthorizationService.check_role_permission(user_role, permission):
            AuthorizationService.log_security_event(
                "PERMISSION_DENIED",
                user_id=user_info.get("user_login"),
                details=f"Required permission: {permission}, User role: {user_role}",
                ip_address=request.client.host if request else None,
                request=request
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required: {permission}"
            )
        
        return user_info
    
    return permission_dependency


def require_role(min_role: str):
    """
    Dependency factory to require minimum role level
    """
    async def role_dependency(
        user_info: Dict[str, Any] = Depends(get_current_user_with_permissions),
        request: Request = None
    ):
        # Get user role from token payload
        user_role = user_info.get("payload", {}).get("role", "user")
        
        if not AuthorizationService.check_role_hierarchy(user_role, min_role):
            AuthorizationService.log_security_event(
                "INSUFFICIENT_ROLE",
                user_id=user_info.get("user_login"),
                details=f"Required role: {min_role}, User role: {user_role}",
                ip_address=request.client.host if request else None,
                request=request
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient role level. Required: {min_role}"
            )
        
        return user_info
    
    return role_dependency


async def verify_api_key_dependency(
    api_key: str = None,
    request: Request = None
) -> bool:
    """
    Dependency to verify API key for internal services
    """
    if not AuthorizationService.verify_api_key(api_key):
        AuthorizationService.log_security_event(
            "INVALID_API_KEY",
            details="API key verification failed",
            ip_address=request.client.host if request else None,
            request=request
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )
    
    return True