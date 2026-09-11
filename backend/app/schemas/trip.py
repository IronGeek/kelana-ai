from enum import StrEnum

from pydantic import BaseModel, ConfigDict


class TripCategory(StrEnum):
    BACKPACKER = "backpacker"
    STANDARD = "standard"
    LUXURY = "luxury"


class TripCreateRequest(BaseModel):
    destination: str
    days: int
    budget: float
    styles: list[str] | None = None


class TripCreateResponse(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    id: str
    destination: str
    days: int
    budget: float
    category: TripCategory
    styles: list[str] | None = None


class TripFilterRequest(BaseModel):
    destination: str | None = None
    style: str | None = None


class TripResponse(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    id: str
    account_id: str
    destination: str
    days: int
    budget: float
    daily_budget: float
    category: TripCategory
    styles: list[str]
    created_at: str
    pending: bool | None = False
    error: str | None = None
    updated_at: str | None = None
    row_num: int | None = 0


class TripDetailResponse(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    id: str
    account_id: str
    destination: str
    days: int
    budget: float
    daily_budget: float
    category: TripCategory
    styles: list[str]
    created_at: str
    recommendation: str | None
    pending: bool | None = False
    error: str | None = None
    updated_at: str | None = None
    row_num: int | None = 0


class TripStatusResponse(BaseModel):
    id: str
    pending: bool
    recommendation: str | None = None
    message: str | None = None
