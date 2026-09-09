import uuid

from sqlalchemy import (
    UUID,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)
from sqlalchemy.sql import func

from app.core.db import Base


class Trip(Base):
    __tablename__ = "trip"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("uuidv7()")
    )
    account_id = Column(
        UUID, ForeignKey("account.id", ondelete="SET NULL"), nullable=True, index=True
    )
    destination = Column(String(100), nullable=False)
    days = Column(Integer, nullable=False, default=0)
    budget = Column(Numeric(10, 2), nullable=False)
    daily_budget = Column(Numeric(10, 2), nullable=False)
    category = Column(String(15), nullable=False)
    styles = Column(ARRAY(Text), nullable=False, server_default="{}")
    recommendation = Column(Text, nullable=True)
    pending = Column(Boolean, nullable=False, default=False)
    error = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    account = relationship("Account", back_populates="trips")

    @property
    def updated_at_iso(self):
        if self.updated_at:
            return self.updated_at.isoformat() + "Z"
        return None

    @property
    def created_at_iso(self):
        return self.created_at.isoformat() + "Z"
