from asyncio import timeout

from fastapi import (
    FastAPI,
    Request,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import (
    JSONResponse,
)

from app.core.config import settings
from app.schemas.health import HealthResponse
from app.services.health import check_postgres_health

app = FastAPI(
    title=settings.APP_NAME,
    docs_url="/docs" if settings.is_development else None,
    redoc_url="/redoc" if settings.is_development else None,
    openapi_url="/openapi.json" if settings.is_development else None,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.APP_FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers_to_health(request: Request, call_next):
    response = await call_next(request)

    if "health" in request.url.path or "metrics" in request.url.path:
        response.headers["Cache-Control"] = (
            "no-store, no-cache, must-revalidate, max-age=0"
        )
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"

    return response


# a GET endpoint at the root path
@app.get("/", tags=["Root"], include_in_schema=False)
async def home(request: Request):
    return {"message": "Welcome to KelanaAI"}


@app.get(
    "/health",
    tags=["Root"],
    status_code=status.HTTP_200_OK,
    response_model=HealthResponse,
)
async def health():
    try:
        async with timeout(2.0):
            healthy = await check_postgres_health()
    except TimeoutError:
        healthy = False

    response = HealthResponse(
        status="pass" if healthy else "fail",
        database="online" if healthy else "offline",
    )
    status_code = status.HTTP_200_OK if healthy else status.HTTP_503_SERVICE_UNAVAILABLE

    return JSONResponse(status_code=status_code, content=response.model_dump())
