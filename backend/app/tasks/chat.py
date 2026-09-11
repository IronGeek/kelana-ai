from logging import getLogger
from time import time
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import joinedload
from sqlalchemy.orm.exc import ObjectDeletedError

from app.core.db import SessionLocal
from app.core.sid import to_uuid
from app.models.conversation import Conversation
from app.models.message import Message
from app.schemas.bedrock import ChatContent, ChatHistory
from app.schemas.conversation import ConversationMessage
from app.services.bedrock import get_ai_answer

logger = getLogger("tasks_logger")


def _sanitize_history(history: list[ChatHistory]) -> list[ChatHistory]:
    """
    Ensures history perfectly alternates user -> assistant.
    If two 'user' messages are consecutive, it merges their text.
    """
    sanitized = []

    for message in history:
        # If the list is empty, just add the first message (must be user)
        if not sanitized:
            if message.role == "user":
                sanitized.append(message)
            continue

        last_message = sanitized[-1]

        # If consecutive roles match, merge their text blocks
        if last_message.role == message.role:
            # Combine the text contents if its different
            current_text = last_message.content[0].text
            new_text = message.content[0].text

            if current_text != new_text:
                last_message.content[0].text = f"{current_text}\n\n{new_text}"
        elif message.role == "assistant" and not message.content[0].text:
            # skip empty reponse from previous run, probably due to timeout
            continue
        else:
            sanitized.append(message)

    return sanitized


def _build_history(messages: list[ConversationMessage]) -> list[ChatHistory]:
    history = list(
        map(
            lambda u: ChatHistory(
                role=u.role, content=list([ChatContent(text=u.content)])
            ),
            sorted(messages, key=lambda m: m.created_at),
        )
    )

    return _sanitize_history(history)


async def generate_chat_answer(id: str, account_id: str):
    """A worker function that runs entirely in the background."""

    uuid = id if isinstance(id, UUID) else to_uuid(id)
    acid = account_id if isinstance(account_id, UUID) else to_uuid(account_id)

    async with SessionLocal() as session:
        try:
            stmt = (
                select(Conversation)
                .options(joinedload(Conversation.messages))
                .where(Conversation.id == uuid)
            )
            result = await session.scalars(stmt)
            conv = result.first()

            if conv is None:
                logger.warning(
                    f"[generate_chat_answer] ({id}) task cancelled, record does not exist."  # noqa: E501
                )
                return

            if conv.pending:
                diff = time() - conv.updated_at.timestamp()
                if diff < 30:
                    logger.warning(
                        f"[generate_chat_answer] ({id}) task cancelled, record is currently pending."  # noqa: E501
                    )
                    return

                # if last updated more than 30s ago assume this is hanging conversation
                logger.warning(
                    f"[generate_chat_answer] ({id}) task resumed, record seems to be hanging."  # noqa: E501
                )

            conv.pending = True
            await session.commit()

            logger.info(f"[generate_chat_answer] ({id}) task started.")
            history = _build_history(conv.messages)
            response = await get_ai_answer(id=uuid, account_id=acid, history=history)

            try:
                await session.refresh(conv)
            except ObjectDeletedError:
                # A scenario where a record is deleted by the user
                # while the AI ​​is thinking
                logger.warning(
                    f"[generate_chat_answer] ({id}) task cancelled, record no longer exist."  # noqa: E501
                )

            if not conv.pending:
                # A scenario where a task is completed by external process
                # while the AI ​​is thinking
                logger.warning(
                    f"[generate_chat_answer] ({id}) task cancelled, task already completed."  # noqa: E501
                )
                return

            if response.success:
                data = response.data
                message = Message(
                    conversation_id=conv.id,
                    role="assistant",
                    content=data.answer,
                    # sources=response.data.sources
                )

                session.add(message)

                # TODO:
                # if not data.metrics is None:
                #    record metrics here

                f"[generate_chat_answer] ({id}) task completed successfully"
            else:
                f"[generate_chat_answer] ({id}) task failed: {response.error}"  # noqa: E501

            conv.pending = False
            await session.commit()

        except Exception as e:
            logger.error(f"[generate_chat_answer] ({id}) critical DB error: {e}")
            await session.rollback()
