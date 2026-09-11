from pydantic import BaseModel


class ConversationCreateRequest(BaseModel):
    title: str | None = ""


class ConversationCreateResponse(BaseModel):
    id: str
    title: str


class ConversationResponse(BaseModel):
    id: str
    account_id: str
    title: str
    created_at: str
    pending: bool | None = False
    error: str | None = None
    updated_at: str | None = None
    row_num: int | None = 0


class ConversationDetailResponse(BaseModel):
    id: str
    account_id: str
    title: str
    created_at: str
    messages: list[ConversationMessage]
    pending: bool | None = False
    error: str | None = None
    updated_at: str | None = None
    row_num: int | None = 0


class ConversationFilterRequest(BaseModel):
    title: str | None = None


class ConversationMessage(BaseModel):
    id: str
    role: str
    content: str
    created_at: str


class ConversationUpdateRequest(BaseModel):
    title: str | None = ""


class ConversationMessageRequest(BaseModel):
    id: str
    role: str
    content: str
    with_kb: bool | None = None


class ConversationStatusResponse(BaseModel):
    id: str
    pending: bool
    message: str | None = None
    role: str | None = None
    content: str | None = None
    create_at: str | None = None
