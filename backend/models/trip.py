import uuid
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    Integer,
    String,
    text,
    Text,
    UUID
)
from sqlalchemy.sql import func
from sqlalchemy.orm import (
    Mapped,
    mapped_column
)
from sqlalchemy.dialects.postgresql import ARRAY
from database import Base

class Trip(Base):
    __tablename__     = "trips"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("uuidv7()")
    )
    destination       = Column(String, nullable=False)
    days              = Column(Integer, nullable=False)
    category          = Column(String, nullable=False)
    transport         = Column(String, nullable=False)
    budget            = Column(Float, nullable=False)
    daily_budget      = Column(Float, nullable=False)
    travel_style      = Column(ARRAY(String), nullable=False, server_default="{}")
    recommendation    = Column(Text, nullable=True)
    input_tokens      = Column(Integer, nullable=True)
    output_tokens     = Column(Integer, nullable=True)
    total_tokens      = Column(Integer, nullable=True)
    execution_time    = Column(Float, nullable=True)
    processing        = Column(Boolean, nullable=False, default=False)
    error             = Column(String, nullable=True)
    created_at        = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at        = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
