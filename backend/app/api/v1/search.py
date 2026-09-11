from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.paging import to_paged_response
from app.models.account import Account
from app.schemas.auth import (
    AccountFilterRequest,
    AccountResponse,
)
from app.schemas.response import PagedRequest, PagedResponse
from app.services.auth import (
    AuthenticationError,
    current_account,
    filter_accounts,
)

router = APIRouter(tags=["Search"], prefix="/search")


@router.post(
    "/accounts",
    status_code=status.HTTP_200_OK,
    response_model=PagedResponse[AccountResponse],
    response_model_exclude_none=True,
)
async def search_accounts(
    session: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[Account, Depends(current_account)],
    filter: PagedRequest[AccountFilterRequest] | None = None,
):
    try:
        if not current_user.is_admin:
            raise AuthenticationError("Unauthorized")

        [data, total] = await filter_accounts(session=session, filter=filter)

        return to_paged_response(data, total, filter and filter.page)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc
