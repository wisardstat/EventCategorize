from datetime import datetime, timedelta
from typing import Optional, List
from jose import JWTError, jwt
import os
import logging
from fastapi import HTTPException, status
from app.core.config import get_settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get settings
settings = get_settings()

# JWT settings
SECRET_KEY = settings.secret_key
ALGORITHM = settings.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes


def verify_password(plain_password: str, stored_password: str) -> bool:
    """Verify a password by comparing plain text directly."""
    if not plain_password or not stored_password:
        return False
    return plain_password == stored_password


def get_password_hash(password: str) -> str:
    """Return password as plain text (no hashing)."""
    if not password or password.strip() == "":
        raise ValueError("Password cannot be empty")
    return password


def validate_password_hash(password: str) -> bool:
    """
    Validate that a password is not empty (basic validation only).
    
    Args:
        password: The password to validate
        
    Returns:
        bool: True if the password is valid, False otherwise
    """
    if not password or password.strip() == "":
        return False
    return True


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Optional[dict]:
    """Verify JWT token and return payload."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def verify_api_key(api_key: str) -> bool:
    """Verify API key for internal services."""
    if not api_key:
        return False
    return api_key == settings.internal_api_key


def check_user_permission(user_role: str, required_roles: List[str]) -> bool:
    """Check if user has required permission based on role."""
    if not user_role or not required_roles:
        return False
    
    # Admin has access to everything
    if user_role.lower() == "admin":
        return True
    
    # Check if user role is in required roles
    return user_role.lower() in [role.lower() for role in required_roles]


def require_role(required_roles: List[str]):
    """Decorator to check user role for endpoint access."""
    def decorator(func):
        def wrapper(*args, **kwargs):
            # This will be used in FastAPI dependencies
            return func(*args, **kwargs)
        return wrapper
    return decorator


def log_security_event(event_type: str, user_id: str = None, details: str = None, ip_address: str = None):
    """Log security events for audit purposes."""
    log_message = f"Security Event: {event_type}"
    if user_id:
        log_message += f" | User: {user_id}"
    if details:
        log_message += f" | Details: {details}"
    if ip_address:
        log_message += f" | IP: {ip_address}"
    
    logger.warning(log_message)