from sqlalchemy import (
    Column,
    DateTime,
    Float,
    Integer,
    String,
    Text
)
from sqlalchemy.sql import func
from database import Base

class Trip(Base):
    __tablename__     = "trips"
    id                = Column(Integer, primary_key=True)
    destination       = Column(String, nullable=False)
    days              = Column(Integer, nullable=False)
    budget            = Column(Float, nullable=False)
    travel_style      = Column(String, nullable=False)
    daily_budget      = Column(Float, nullable=False)
    category          = Column(String, nullable=False)
    transport         = Column(String, nullable=False)
    ai_recommendation = Column(Text, nullable=True)
    created_at        = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at        = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
