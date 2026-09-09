import uuid

from sqlalchemy import (
    UUID,
    Boolean,
    Column,
    DateTime,
    String,
    text,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)
from sqlalchemy.sql import func

from app.core.db import Base


class Account(Base):
    __tablename__ = "account"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("uuidv7()")
    )
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    email_verified = Column(Boolean, nullable=False, default=False)
    phone_number = Column(String(15), nullable=True)
    phone_verified = Column(Boolean, nullable=False, default=False)
    password_hash = Column(String(255), nullable=False)
    admin = Column(Boolean, nullable=False, default=False)
    avatar_url = Column(String(255), nullable=True)
    avatar_provider = Column(String(10), nullable=True)
    about = Column(String(255), nullable=True)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    trips = relationship("Trip", back_populates="account")
    conversations = relationship(
        "Conversation", back_populates="account", cascade="all, delete-orphan"
    )

    @property
    def updated_at_iso(self):
        if self.updated_at:
            return self.updated_at.isoformat() + "Z"
        return None

    @property
    def created_at_iso(self):
        return self.created_at.isoformat() + "Z"
