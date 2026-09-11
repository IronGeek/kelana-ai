from pydantic import BaseModel


class AIRecommendation(BaseModel):
    success: bool
    markdown: str | None = None
    error: str | None = None


class AskRequest(BaseModel):
    question: str
    with_kb: bool | None = False


class AskSources(BaseModel):
    title: str
    document_id: str
    location: str
    metadata: dict[str, str]
    score: float


class AskAnswer(BaseModel):
    question: str
    answer: str
    sources: list[AskSources] | None = []


class AIAskResponse(BaseModel):
    success: bool
    error: str | None = None
    data: AskAnswer | None = None


class ChatContent(BaseModel):
    text: str


class ChatHistory(BaseModel):
    role: str
    content: list[ChatContent]


class ChatSources(BaseModel):
    title: str
    document_id: str
    location: str
    metadata: dict[str, str]
    score: float


class ChatAnswer(BaseModel):
    answer: str
    sources: list[ChatSources] | None = []


class AIChatResponse(BaseModel):
    success: bool
    error: str | None = None
    data: ChatAnswer | None = None
