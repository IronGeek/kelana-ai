from fastapi import APIRouter

from app.api.v1 import (
    auth,
    conversations,
    kb,
    search,
    trips,
)

router = APIRouter(prefix="/v1")
router.include_router(auth.router)
router.include_router(trips.router)
router.include_router(search.router)
router.include_router(kb.router)
router.include_router(conversations.router)
