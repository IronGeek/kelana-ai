import uuid

from sqlalchemy import (
    UUID,
    Column,
    DateTime,
    ForeignKey,
    String,
    Text,
    text,
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)
from sqlalchemy.sql import func

from app.core.db import Base


class Message(Base):
    __tablename__ = "message"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("uuidv7()")
    )
    conversation_id = Column(
        UUID,
        ForeignKey("conversation.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role = Column(String(15), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    conversation = relationship("Conversation", back_populates="messages")

    @property
    def updated_at_iso(self):
        if self.updated_at:
            return self.updated_at.isoformat() + "Z"
        return None

    @property
    def created_at_iso(self):
        return self.created_at.isoformat() + "Z"
