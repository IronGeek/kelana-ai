from logging import getLogger
from time import time
from uuid import UUID

from sqlalchemy.orm.exc import ObjectDeletedError

from app.core.db import SessionLocal
from app.core.sid import to_uuid
from app.models.trip import Trip
from app.services.bedrock import get_ai_recommendation

logger = getLogger("tasks_logger")


async def generate_recommendation(id: str, account_id: str):
    """A worker function that runs entirely in the background."""

    uuid = id if isinstance(id, UUID) else to_uuid(id)
    acid = account_id if isinstance(account_id, UUID) else to_uuid(account_id)

    async with SessionLocal() as session:
        try:
            trip = await session.get(Trip, uuid)
            if trip is None:
                logger.warning(
                    f"[generate_recommendation] ({id}) task cancelled, record does not exist."  # noqa: E501
                )
                return

            if trip.pending:
                diff = time() - trip.updated_at.timestamp()
                if diff < 30:
                    logger.warning(
                        f"[generate_recommendation] ({id}) task cancelled, record is currently pending."  # noqa: E501
                    )
                    return

                logger.warning(
                    f"[generate_recommendation] ({id}) task resumed, record seems to be hanging."  # noqa: E501
                )

            trip.pending = True
            await session.commit()

            logger.info(f"[generate_recommendation] ({id}) task started.")
            recommendation = await get_ai_recommendation(
                id=uuid,
                account_id=acid,
                destination=trip.destination,
                days=trip.days,
                budget=trip.budget,
                styles=trip.styles or [],
            )

            try:
                await session.refresh(trip)
            except ObjectDeletedError:
                # A scenario where a record is deleted by the user
                # while the AI ​​is thinking
                logger.warning(
                    f"[generate_recommendation] ({id}) task cancelled, record no longer exist."  # noqa: E501
                )

            if not trip.pending:
                # A scenario where a task is completed by external process
                # while the AI ​​is thinking
                logger.warning(
                    f"[generate_recommendation] ({id}) task cancelled, task already completed."  # noqa: E501
                )
                return

            if recommendation.success:
                trip.recommendation = recommendation.markdown
                logger.info(
                    f"[generate_recommendation] ({id}) task completed successfully"
                )
            else:
                logger.error(
                    f"[generate_recommendation] ({id}) task failed: {recommendation.error}"  # noqa: E501
                )

            trip.pending = False
            await session.commit()
        except Exception as e:
            logger.error(f"[generate_recommendation] ({id})critical DB error: {e}")
            await session.rollback()
