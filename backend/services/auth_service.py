from datetime import datetime, timedelta, timezone
from os import getenv

from bcrypt import (
    checkpw,
    gensalt,
    hashpw,
)
from jwt import encode
from models.user import User
from pydantic import (
    BaseModel,
    field_validator,
)
from sqlalchemy import Session

JWT_SECRET_KEY  = getenv("JWT_SECRET_KEY")
JWT_ALGORITHM   = getenv("JWT_ALGORITHM",  "HS256")
JWT_EXPIRE_MINUTES = int(getenv("JWT_EXPIRE_MINUTES", "60"))

class RegisterRequest(BaseModel):
    name:     str
    email:    str
    password: str

    @field_validator("email")
    @classmethod
    def email_must_contain_at(cls, v: str) -> str:
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Invalid email address")
        return v.lower().strip()

class LoginRequest(BaseModel):
    email:    str
    password: str

    @field_validator("email")
    @classmethod
    def email_must_contain_at(cls, v: str) -> str:
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Invalid email address")
        return v.lower().strip()

def _create_access_token(user_id: int, email: str) -> str:
    """Create a signed JWT containing the user's id and email."""
    # Optional safety check to prevent obscure runtime errors later
    if not JWT_SECRET_KEY:
        raise ValueError("JWT_SECRET_KEY is missing from the environment or .env file.")

    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES),
    }
    return encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def hash_password(plain_password: str) -> str:
    """Hash a plain-text password using bcrypt. Returns the hash as a UTF-8 string."""
    salt = gensalt()
    hashed = hashpw(plain_password.encode("utf-8"), salt)

    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Return True if plain_password matches the stored bcrypt hash."""
    return checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )

def register_user(db: Session, name: str, email: str, password: str) -> User:
    """
    Create and persist a new User.

    Raises ValueError if the email is already taken.
    The caller is responsible for managing the session lifecycle.
    """
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise ValueError("Email already registered")

    user = User(
        name          = name,
        email         = email,
        password_hash = hash_password(password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def login_user(db: Session, email: str, password: str) -> dict:
    """
    Validate credentials and return a JWT token response.

    Returns {"access_token": "...", "token_type": "bearer"}.
    Raises ValueError on invalid email or wrong password.
    """
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        raise ValueError("Invalid email or password")

    return {
        "access_token": _create_access_token(user.id, user.email),
        "token_type": "bearer"
    }
