from typing import Annotated

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.models.account import Account
from app.schemas.conversation import (
    ConversationCreateRequest,
    ConversationCreateResponse,
    ConversationDetailResponse,
    ConversationMessageRequest,
    ConversationResponse,
    ConversationStatusResponse,
    ConversationUpdateRequest,
)
from app.schemas.response import ApiResponse
from app.services.auth import current_account
from app.services.conversation import (
    find_conversation,
    find_last_message,
    new_conversation,
    new_message,
    remove_conversation,
    update_conversation,
)
from app.tasks.chat import generate_chat_answer

router = APIRouter(tags=["Conversation"], prefix="/conversations")


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=ApiResponse[ConversationCreateResponse],
    response_model_exclude_none=True,
)
async def create_conversation(
    request: ConversationCreateRequest,
    session: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[Account, Depends(current_account)],
):
    try:
        response = await new_conversation(
            (request and request.title and request.title.strip()) or None,
            session,
            current_user,
        )

        return ApiResponse[ConversationCreateResponse](
            success=response is not None,
            data=response,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create Conversation: {exc}",
        ) from exc


@router.get(
    "/{id}",
    status_code=status.HTTP_200_OK,
    response_model=ApiResponse[ConversationDetailResponse],
    response_model_exclude_none=True,
)
async def get_conversation(
    id: str,
    session: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[Account, Depends(current_account)],
):
    try:
        response = await find_conversation(session, current_user, id, True)

        if response is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Conversation with id {id} not found",
            )

        return ApiResponse[ConversationDetailResponse](
            success=response is not None,
            data=response,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get Conversation: {exc}",
        ) from exc


@router.patch(
    "/{id}",
    status_code=status.HTTP_200_OK,
    response_model=ApiResponse[ConversationResponse],
    response_model_exclude_none=True,
)
async def patch_conversation(
    id: str,
    request: ConversationUpdateRequest,
    session: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[Account, Depends(current_account)],
):
    try:
        response = await update_conversation(session, current_user, id, request)

        if response is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Conversation with id {id} not found",
            )

        return ApiResponse[ConversationResponse](
            success=response is not None,
            data=response,
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update Conversation with id {id}: {exc}",
        ) from exc


@router.delete(
    "/{id}",
    status_code=status.HTTP_200_OK,
    response_model=ApiResponse[ConversationResponse],
    response_model_exclude_none=True,
)
async def delete_conversation(
    id: str,
    session: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[Account, Depends(current_account)],
):
    try:
        success = await remove_conversation(id, session, current_user)

        return ApiResponse(success=success, data=None)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete Conversation with id {id}: {exc}",
        ) from exc


@router.post(
    "/{id}/messages",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=ApiResponse[ConversationStatusResponse],
    response_model_exclude_none=True,
)
async def create_message(
    id: str,
    request: ConversationMessageRequest,
    tasks: BackgroundTasks,
    session: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[Account, Depends(current_account)],
):
    try:
        role = request and request.role
        content = request and request.content

        if role == "" or content == "":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role or content",
            )

        conv = await find_conversation(session, current_user, id)
        if conv is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Conversation with id {id} not found",
            )

        mesg = await new_message(session, conv.id, role, content, request.id)

        if mesg.role == "user" and not conv.pending:
            tasks.add_task(generate_chat_answer, mesg.conversation_id, current_user.id)

        return ApiResponse[ConversationStatusResponse](
            success=True,
            data=ConversationStatusResponse(
                id=id,
                pending=True,
                message="The conversation is being processed in the background.",
            ),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create message for conversation with id {id}: {exc}",
        ) from exc


@router.post(
    "/{id}/status",
    status_code=status.HTTP_200_OK,
    response_model=ApiResponse[ConversationStatusResponse],
    response_model_exclude_none=True,
)
async def status_conversation(
    id: str,
    session: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[Account, Depends(current_account)],
):
    try:
        conv = await find_conversation(session, current_user, id)

        if conv is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Conversation with id {id} not found",
            )

        if conv.pending:
            return ApiResponse[ConversationStatusResponse](
                success=True,
                data=ConversationStatusResponse(
                    id=id,
                    pending=True,
                    message="The conversation is being processed in the background.",
                ),
            )
        else:
            mesg = await find_last_message(session, conv.id)

            if mesg is None or mesg.role != "assistant":
                return ApiResponse[ConversationStatusResponse](
                    success=True,
                    data=ConversationStatusResponse(
                        id=id,
                        pending=True,
                        message="The conversation is being processed in the background.",  # noqa: E501
                    ),
                )

            return ApiResponse[ConversationStatusResponse](
                success=True,
                data=ConversationStatusResponse(
                    id=id,
                    pending=False,
                    role=mesg.role,
                    content=mesg.content,
                    created_at=mesg.created_at,
                ),
            )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get status for Conversation {id}: {exc}",
        ) from exc
