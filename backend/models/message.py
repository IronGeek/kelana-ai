import uuid

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    String,
    Text,
    UUID,
    text,
)
from sqlalchemy.sql import func
from database import Base
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

class Message(Base):
    __tablename__ = "messages"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("uuidv7()")
    )
    conversation_id  = Column(UUID, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    role             = Column(String(16), nullable=False)
    content          = Column(Text, nullable=False)
    created_at       = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at       = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    conversation = relationship("Conversation", back_populates="messages")
