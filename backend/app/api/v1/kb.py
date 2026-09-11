from typing import Annotated
from uuid import uuid7

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from app.models.account import Account
from app.schemas.bedrock import (
    AskAnswer,
    AskRequest,
)
from app.schemas.response import ApiResponse
from app.services.auth import current_account
from app.services.bedrock import retrieve_and_generate

router = APIRouter(tags=["KB"], prefix="/kb")


@router.post(
    "/ask",
    status_code=status.HTTP_200_OK,
    response_model=ApiResponse[AskAnswer],
    response_model_exclude_none=True,
)
async def ask(
    request: AskRequest,
    current_user: Annotated[Account, Depends(current_account)],
) -> ApiResponse[AskAnswer]:
    try:
        response = await retrieve_and_generate(
            uuid7(),
            current_user.id,
            request.question,
            request.with_kb or False,
        )

        return ApiResponse(
            success=response.success, data=response.data, error=response.error
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)
        ) from exc
