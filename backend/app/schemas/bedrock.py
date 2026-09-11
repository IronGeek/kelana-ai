from pydantic import BaseModel


class AIRecommendation(BaseModel):
    success: bool
    markdown: str | None = None
    error: str | None = None
