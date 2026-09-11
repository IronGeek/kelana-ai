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
from app.schemas.response import ApiResponse
from app.schemas.trip import (
    TripCreateRequest,
    TripCreateResponse,
    TripDetailResponse,
    TripStatusResponse,
)
from app.services.auth import current_account
from app.services.trip import (
    find_trip,
    new_trip,
    remove_trip,
)
from app.tasks.trip import generate_recommendation

router = APIRouter(tags=["Trip"], prefix="/trips")


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=ApiResponse[TripCreateResponse],
    response_model_exclude_none=True,
)
async def create_trip(
    request: TripCreateRequest,
    session: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[Account, Depends(current_account)],
):
    try:
        response = await new_trip(request, session, current_user)

        return ApiResponse[TripCreateResponse](
            success=response is not None,
            data=response,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create Trip: {exc}",
        ) from exc


@router.get(
    "/{id}",
    status_code=status.HTTP_200_OK,
    response_model=ApiResponse[TripDetailResponse],
    response_model_exclude_none=True,
)
async def get_trip(
    id: str,
    session: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[Account, Depends(current_account)],
):
    try:
        response = await find_trip(id, session, current_user, True)

        if response is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Trip with id {id} not found",
            )

        return ApiResponse[TripDetailResponse](
            success=response is not None,
            data=response,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to get Trip: {exc}",
        ) from exc


@router.post(
    "/{id}/generate",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=ApiResponse[TripStatusResponse],
    response_model_exclude_none=True,
)
async def generate_trip(
    id: str,
    tasks: BackgroundTasks,
    session: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[Account, Depends(current_account)],
):
    try:
        trip = await find_trip(id, session, current_user)

        if trip is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Trip with id {id} not found",
            )

        if not trip.pending:
            tasks.add_task(generate_recommendation, trip.id, current_user.id)

        return ApiResponse[TripStatusResponse](
            success=True,
            data=TripStatusResponse(
                id=id,
                pending=True,
                message="The itinerary is being processed in the background.",
            ),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate recommendation for Trip {id}. {exc}",
        ) from exc


@router.post(
    "/{id}/status",
    status_code=status.HTTP_200_OK,
    response_model=ApiResponse[TripStatusResponse],
    response_model_exclude_none=True,
)
async def status_trip(
    id: str,
    session: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[Account, Depends(current_account)],
):
    try:
        trip = await find_trip(id, session, current_user, True)

        if trip is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Trip with id {id} not found",
            )

        if trip.pending:
            return ApiResponse[TripStatusResponse](
                success=True,
                data=TripStatusResponse(
                    id=id,
                    pending=True,
                    message="The itinerary is being processed in the background.",
                ),
            )
        else:
            return ApiResponse[TripStatusResponse](
                success=True,
                data=TripStatusResponse(
                    id=id,
                    pending=False,
                    recommendation=trip.recommendation,
                ),
            )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get status for Trip {id}: {exc}",
        ) from exc


@router.delete(
    "/{id}",
    status_code=status.HTTP_200_OK,
    response_model=ApiResponse[None],
    response_model_exclude_none=True,
)
async def delete_trip(
    id: str,
    session: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[Account, Depends(current_account)],
):
    try:
        success = await remove_trip(id, session, current_user)

        return ApiResponse(success=success, data=None)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete Trip with id {id}: {exc}",
        ) from exc
