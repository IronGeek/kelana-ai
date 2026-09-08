from typing import Annotated

from bcrypt import (
    gensalt,
    hashpw,
)
from fastapi import Depends

from app.core.db import get_db
from app.models.account import Account


def hash_password(plain_password: str) -> str:
    """Hash a plain-text password using bcrypt. Returns the hash as a UTF-8 string."""

    salt = gensalt()
    hashed = hashpw(plain_password.encode("utf-8"), salt)

    return hashed.decode("utf-8")


def create_account(
    session: Annotated[dict, Depends(get_db)],
    name: str,
    email: str,
    password: str,
    admin: bool = False,
) -> Account:
    """
    Create and persist a new Account.

    Raises ValueError if the email is already taken.
    The caller is responsible for managing the session lifecycle.
    """
    existing = session.query(Account).filter(Account.email == email).first()
    if existing:
        raise ValueError("Email already registered")

    account = Account(
        name=name,
        email=email,
        password_hash=hash_password(password),
        admin=admin,
    )
    session.add(account)
    session.commit()
    session.refresh(account)

    return account
