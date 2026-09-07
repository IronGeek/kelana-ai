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

from app.models import Base


class User(Base):
    __tablename__ = "user"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("uuidv7()")
    )
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    email_verified = Column(Boolean, nullable=False, default=False)
    phone_number = Column(String(15), nullable=True)
    phone_verified = Column(Boolean, nullable=False, default=False)
    password_hash = Column(String(255), nullable=False)
    avatar_url = Column(String(255), nullable=True)
    avatar_provider = Column(String(10), nullable=True)
    about = Column(String(255), nullable=True)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    trips = relationship("Trip", back_populates="User")
    conversations = relationship(
        "Conversation", back_populates="User", cascade="all, delete-orphan"
    )
