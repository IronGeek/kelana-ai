import uuid

from database import Base
from sqlalchemy import (
    UUID,
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


class User(Base):
    __tablename__     = "users"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("uuidv7()")
    )
    name          = Column(String(100),  nullable=False)
    email         = Column(String(255),  nullable=False, unique=True)
    password_hash = Column(String(255),  nullable=False)
    created_at    = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at    = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    trips = relationship("Trip", back_populates="user")
