import contextlib
import logging
from database import SessionLocal
from services.trip_service import TripRequest
from services.bedrock_service import get_ai_recommendation
from models.trip import Trip

logger = logging.getLogger("tasks_logger")

def generate_recommendation(tracking_id: str, request: TripRequest):
    """A worker function that runs entirely in the background."""
    logger.info(f"Background task started: {tracking_id}")

    with contextlib.closing(SessionLocal()) as db:
        try:
            trip = db.query(Trip).filter(Trip.tracking_id == tracking_id and Trip.processing == True).first()
            if trip is None:
                logger.warning(f"Background task cancelled, record does not exist: {tracking_id}")
                return

            recommendation = get_ai_recommendation(
                destination=request.destination,
                days=request.days,
                budget=request.budget,
                travel_style=request.travel_style
            )

            trip_current = db.query(Trip).filter(Trip.tracking_id == tracking_id and Trip.processing == True).first()
            if not trip_current:
                # A scenario where a record is deleted by the user while the AI ​​is thinking
                logger.warning(f"Background task cancelled, record no longer exist: {tracking_id}")
                return

            trip_current.processing = False

            if recommendation.success:
                trip_current.ai_recommendation = recommendation.markdown
                if not recommendation.metrics is None:
                    trip_current.input_tokens = recommendation.metrics.input_tokens
                    trip_current.output_tokens = recommendation.metrics.output_tokens
                    trip_current.total_tokens = recommendation.metrics.total_tokens
                    trip_current.execution_time = recommendation.metrics.execution_time
                logger.info(f"Background task completed successfully: {tracking_id}")
            else:
                logger.error(f"Background task failed: {tracking_id} - {recommendation.error}")

            db.commit()
        except Exception as e:
            db.rollback()
            logger.error(f"Critical database error in background task: {tracking_id} - {e}")
