import uuid

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    UUID,
    String,
    text,
)
from sqlalchemy.sql import func
from database import Base
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("uuidv7()")
    )
    user_id       = Column(UUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title         = Column(String(255), nullable=True)
    pending       = Column(Boolean, nullable=False, default=False)
    created_at    = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at    = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="conversations")
    messages = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
    )
