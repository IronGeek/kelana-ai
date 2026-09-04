import contextlib
import logging

from time import time
from database import SessionLocal
from models.conversation import Conversation
from models.message import Message
from services.conversation_service import (
    ChatMessage,
    ChatHistory,
    ChatContent,
    get_ai_answer,
)
from sqlalchemy.orm.exc import ObjectDeletedError

logger = logging.getLogger("tasks_logger")

def _sanitize_history(history: list[ChatMessage]) -> list[ChatMessage]:
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

            print(f"{current_text} == {new_text}")

            if current_text != new_text:
                last_message.content[0].text = f"{current_text}\n\n{new_text}"
        elif message.role == "assistant" and not message.content[0].text:
            # skip empty reponse from previous run, probably due to timeout
            continue
        else:
            sanitized.append(message)

    return sanitized

def _build_history(messages: list[ChatMessage]) -> list[ChatHistory]:
    history = list(
        map(
            lambda u: ChatHistory(role=u.role, content=list([ChatContent(text=u.content)])),
            sorted(messages, key=lambda m: m.created_at),
        )
    )

    return _sanitize_history(history)

def generate_chat_answer(id: str):
    with contextlib.closing(SessionLocal()) as db:
        try:
            conv = db.get(Conversation, id)
            if conv is None:
                logger.warning(f"Background task cancelled, record does not exist: {id}")
                return

            if conv.pending:
                diff = time() - conv.updated_at.timestamp()
                if diff < 30:
                    logger.warning(f"Background task cancelled, record is currently processing: {id}")
                    return

                # if last updated more than 30s ago assume this is hanging conversation
                logger.warning(f"Background task resumed, record seems to be hanging: {id}")

            conv.pending = True
            db.commit()
            logger.info(f"Background task started: {id}")

            history = _build_history(conv.messages)
            response = get_ai_answer(conv.id, history)

            try:
                db.refresh(conv)
            except ObjectDeletedError:
                # A scenario where a record is deleted by the user while the AI ​​is thinking
                logger.warning(f"Background task cancelled, record no longer exist: {id}")

            if not conv.pending:
                # A scenario where a task is completed by external process while the AI ​​is thinking
                logger.warning(f"Background task cancelled, task already completed: {id}")
                return

            if response.success:
                data = response.data
                message = Message(
                    conversation_id=conv.id,
                    role="assistant",
                    content=data.answer
                    # sources=response.data.sources
                )

                db.add(message)

                # TODO:
                # if not data.metrics is None:
                #    record metrics here

                logger.info(f"Background task completed successfully: {id}")
            else:
                logger.error(f"Background task failed: {id} - {response.error}")

            conv.pending = False
            db.commit()
        except Exception as e:
            db.rollback()
            logger.error(f"Critical database error in background task: {id} - {e}")
