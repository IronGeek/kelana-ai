from typing import Annotated
from uuid import UUID

from fastapi import Depends
from sqlalchemy import (
    any_,
    delete,
    func,
    literal,
    or_,
    select,
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import defer

from app.core.db import get_db
from app.core.paging import resolve_paging
from app.core.sid import from_uuid, to_uuid
from app.models.account import Account
from app.models.trip import Trip
from app.schemas.response import PagedRequest
from app.schemas.trip import (
    TripCategory,
    TripCreateRequest,
    TripCreateResponse,
    TripDetailResponse,
    TripFilterRequest,
    TripResponse,
)
from app.services.auth import current_account


def from_trip(
    entry: Trip, detail: bool | None = False, row_num: int = 0
) -> TripResponse | TripDetailResponse:
    if detail:
        return TripDetailResponse(
            row_num=row_num,
            id=from_uuid(entry.id),
            account_id=from_uuid(entry.account_id),
            destination=entry.destination,
            days=entry.days,
            budget=entry.budget,
            daily_budget=entry.daily_budget,
            category=entry.category,
            styles=entry.styles,
            recommendation=entry.recommendation,
            created_at=entry.created_at_iso,
            updated_at=entry.updated_at_iso,
        )

    return TripResponse(
        row_num=row_num,
        id=from_uuid(entry.id),
        account_id=from_uuid(entry.account_id),
        destination=entry.destination,
        days=entry.days,
        budget=entry.budget,
        daily_budget=entry.daily_budget,
        category=entry.category,
        styles=entry.styles,
        created_at=entry.created_at_iso,
        updated_at=entry.updated_at_iso,
    )


def get_trip_category(budget: float, days: int) -> TripCategory:
    # TODO: Should probably refactor the logic to be configurable
    daily = budget / days
    if daily < 100:
        return TripCategory.BACKPACKER
    elif daily <= 250:
        return TripCategory.STANDARD
    else:
        return TripCategory.LUXURY


async def filter_trips(
    session: Annotated[AsyncSession, Depends(get_db)],
    filter: PagedRequest[TripFilterRequest] | None = None,
) -> tuple[list[TripResponse], int]:
    row_num = (
        func.row_number()
        .over(order_by=func.coalesce(Trip.updated_at, Trip.created_at).desc())
        .label("row_num")
    )

    query = (
        select(Trip, row_num)
        .options(defer(Trip.recommendation, raiseload=True))
        .order_by(func.coalesce(Trip.updated_at, Trip.created_at).desc())
    )
    if filter and filter.query:
        query = query.where(
            or_(
                Trip.destination.ilike(f"%{filter.query}%"),
                Trip.category.ilike(f"%{filter.query}%"),
                literal(filter.query).ilike(any_(Trip.styles)),
            )
        )

    total = await session.scalar(
        query.with_only_columns(func.count(Trip.id)).order_by(None)
    )

    size, offset = resolve_paging(filter and filter.page)

    result = await session.execute(query.limit(size).offset(offset))
    data = [
        from_trip(entry, row_num=row_num + offset) for entry, row_num in result.all()
    ]

    return [data, total]


async def new_trip(
    request: TripCreateRequest,
    session: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[Account, Depends(current_account)],
) -> TripCreateResponse:
    trip = Trip(
        account_id=current_user.id,
        destination=request.destination,
        days=request.days,
        budget=request.budget,
        category=get_trip_category(request.budget, request.days),
        styles=request.styles or [],
    )
    session.add(trip)

    await session.commit()
    await session.refresh(trip)

    return TripCreateResponse(
        id=from_uuid(trip.id),
        destination=trip.destination,
        days=trip.days,
        budget=trip.budget,
        category=trip.category,
        styles=trip.styles,
    )


async def find_trip(
    id: str | UUID,
    session: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[Account, Depends(current_account)],
    detail: bool | None = False,
) -> TripResponse | TripDetailResponse:
    uuid = id if isinstance(id, UUID) else to_uuid(id)
    stmt = select(Trip).where(Trip.id == uuid, Trip.account_id == current_user.id)

    if not detail:
        stmt = stmt.options(defer(Trip.recommendation))

    query = await session.scalars(stmt)
    entry = query.first()

    return from_trip(entry, detail) if entry is not None else None


async def remove_trip(
    id: str | UUID,
    session: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[Account, Depends(current_account)],
) -> bool:
    uuid = id if isinstance(id, UUID) else to_uuid(id)
    result = await session.execute(
        delete(Trip).where(Trip.id == uuid, Trip.account_id == current_user.id)
    )
    await session.commit()

    return result.rowcount > 0
