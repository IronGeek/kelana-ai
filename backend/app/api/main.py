from fastapi import APIRouter

from app.api.v1 import auth, search, trips

router = APIRouter(prefix="/v1")
router.include_router(auth.router)
router.include_router(trips.router)
router.include_router(search.router)
