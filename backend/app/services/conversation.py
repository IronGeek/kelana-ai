from typing import Annotated
from uuid import UUID

from fastapi import Depends
from sqlalchemy import delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import (
    joinedload,
    raiseload,
    selectinload,
)

from app.core.db import get_db
from app.core.paging import resolve_paging
from app.core.sid import from_uuid, to_uuid
from app.models.account import Account
from app.models.conversation import Conversation
from app.models.message import Message
from app.schemas.conversation import (
    ConversationCreateResponse,
    ConversationDetailResponse,
    ConversationFilterRequest,
    ConversationMessage,
    ConversationResponse,
    ConversationUpdateRequest,
)
from app.schemas.response import PagedRequest
from app.services.auth import current_account


def from_message(entry: Message) -> ConversationMessage:
    return ConversationMessage(
        id=from_uuid(entry.id),
        role=entry.role,
        content=entry.content,
        created_at=entry.created_at_iso,
    )


def from_conversation(
    entry: Conversation, detail: bool | None = False, row_num: int = 0
) -> ConversationResponse | ConversationDetailResponse:
    if detail:
        return ConversationDetailResponse(
            row_num=row_num,
            id=from_uuid(entry.id),
            account_id=from_uuid(entry.account_id),
            title=entry.title,
            messages=[from_message(msg) for msg in entry.messages],
            created_at=entry.created_at_iso,
            updated_at=entry.updated_at_iso,
        )

    return ConversationResponse(
        row_num=row_num,
        id=from_uuid(entry.id),
        account_id=from_uuid(entry.account_id),
        title=entry.title,
        created_at=entry.created_at_iso,
        updated_at=entry.updated_at_iso,
    )


async def filter_converations(
    session: Annotated[AsyncSession, Depends(get_db)],
    filter: PagedRequest[ConversationFilterRequest] | None = None,
) -> tuple[list[ConversationResponse], int]:
    row_num = (
        func.row_number()
        .over(
            order_by=func.coalesce(
                Conversation.updated_at, Conversation.created_at
            ).desc()
        )
        .label("row_num")
    )

    query = (
        select(Conversation, row_num)
        .options(raiseload(Conversation.messages))
        .order_by(
            func.coalesce(Conversation.updated_at, Conversation.created_at).desc()
        )
    )
    if filter and filter.query:
        query = query.where(Conversation.title.ilike(f"%{filter.query}%"))

    total = await session.scalar(
        query.with_only_columns(func.count(Conversation.id)).order_by(None)
    )

    size, offset = resolve_paging(filter and filter.page)

    result = await session.execute(query.limit(size).offset(offset))
    data = [
        from_conversation(entry, row_num=row_num + offset)
        for entry, row_num in result.all()
    ]

    return [data, total]


async def new_conversation(
    title: str | None,
    session: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[Account, Depends(current_account)],
) -> ConversationCreateResponse:
    conv = Conversation(
        account_id=current_user.id,
        title=title,
    )

    session.add(conv)
    await session.commit()
    await session.refresh(conv)

    return ConversationCreateResponse(id=from_uuid(conv.id), title=conv.title)


async def find_conversation(
    session: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[Account, Depends(current_account)],
    id: str | UUID,
    detail: bool | None = False,
) -> ConversationResponse | ConversationDetailResponse:
    uuid = id if isinstance(id, UUID) else to_uuid(id)
    stmt = select(Conversation).where(
        Conversation.id == uuid, Conversation.account_id == current_user.id
    )

    if detail:
        stmt = stmt.options(joinedload(Conversation.messages))

    query = await session.scalars(stmt)
    entry = query.first()

    return from_conversation(entry, detail) if entry is not None else None


async def update_conversation(
    session: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[Account, Depends(current_account)],
    id: str | UUID,
    updates: ConversationUpdateRequest,
    detail: bool | None = False,
) -> ConversationResponse | ConversationDetailResponse:
    uuid = id if isinstance(id, UUID) else to_uuid(id)
    stmt = (
        update(Conversation)
        .where(Conversation.id == uuid, Conversation.account_id == current_user.id)
        .values(title=updates.title)
        .returning(Conversation)
    )

    if detail:
        stmt = stmt.options(selectinload(Conversation.messages))

    result = await session.execute(stmt)
    entry = result.scalars().first()

    await session.commit()

    return from_conversation(entry, detail) if entry is not None else None


async def remove_conversation(
    id: str | UUID,
    session: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[Account, Depends(current_account)],
) -> bool:
    uuid = id if isinstance(id, UUID) else to_uuid(id)
    result = await session.execute(
        delete(Conversation).where(
            Conversation.id == uuid, Conversation.account_id == current_user.id
        )
    )
    await session.commit()

    return result.rowcount > 0


async def new_message(
    session: Annotated[AsyncSession, Depends(get_db)],
    conversation_id: str | UUID,
    role: str,
    content: str,
    message_id: str | UUID | None = None,
) -> Message:
    conv_id = (
        conversation_id
        if isinstance(conversation_id, UUID)
        else to_uuid(conversation_id)
    )
    if message_id is not None:
        mesg_id = message_id if isinstance(message_id, UUID) else to_uuid(message_id)
    else:
        mesg_id = None

    mesg = Message(
        id=mesg_id,
        conversation_id=conv_id,
        role=role,
        content=content,
    )

    session.add(mesg)
    await session.commit()
    await session.refresh(mesg)

    return mesg


async def find_last_message(
    session: Annotated[AsyncSession, Depends(get_db)],
    conversation_id: str | UUID,
) -> Message:
    conv_id = (
        conversation_id
        if isinstance(conversation_id, UUID)
        else to_uuid(conversation_id)
    )

    stmt = (
        select(Message)
        .where(Message.conversation_id == conv_id)
        .order_by(Message.created_at.desc())
    )

    result = await session.scalars(stmt)

    return result.first()
