import contextlib
import logging
from database import SessionLocal
from services.bedrock_service import get_ai_recommendation
from models.trip import Trip
from sqlalchemy.orm.exc import ObjectDeletedError

logger = logging.getLogger("tasks_logger")

def generate_recommendation(id: str):
    """A worker function that runs entirely in the background."""
    logger.info(f"skip runing recommendation engine")
    return

    with contextlib.closing(SessionLocal()) as db:
        try:
            trip = db.get(Trip, id)
            if trip is None:
                logger.warning(f"Background task cancelled, record does not exist: {id}")
                return

            if trip.processing:
                logger.warning(f"Background task cancelled, record is currently processing: {id}")
                return

            trip.processing = True
            db.commit()
            logger.info(f"Background task started: {id}")

            recommendation = get_ai_recommendation(
                destination=trip.destination,
                days=trip.days,
                budget=trip.budget,
                travel_style=trip.travel_style or []
            )

            try:
                db.refresh(trip)
            except ObjectDeletedError:
                # A scenario where a record is deleted by the user while the AI ​​is thinking
                logger.warning(f"Background task cancelled, record no longer exist: {id}")

            if not trip.processing:
                # A scenario where a task is completed by external process while the AI ​​is thinking
                logger.warning(f"Background task cancelled, task already completed: {id}")
                return

            if recommendation.success:
                trip.recommendation = recommendation.markdown
                if not recommendation.metrics is None:
                    trip.input_tokens = recommendation.metrics.input_tokens
                    trip.output_tokens = recommendation.metrics.output_tokens
                    trip.total_tokens = recommendation.metrics.total_tokens
                    trip.execution_time = recommendation.metrics.execution_time
                logger.info(f"Background task completed successfully: {id}")
            else:
                logger.error(f"Background task failed: {id} - {recommendation.error}")

            trip.processing = False
            db.commit()
        except Exception as e:
            db.rollback()
            logger.error(f"Critical database error in background task: {id} - {e}")
