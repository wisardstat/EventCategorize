from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


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