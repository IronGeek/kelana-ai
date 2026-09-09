from collections.abc import AsyncGenerator

from sqlalchemy import select
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
)
from sqlalchemy.orm import (
    declarative_base,
    noload,
    sessionmaker,
)

from app.core.config import settings

engine = create_async_engine(str(settings.APP_DATABASE_URL), pool_pre_ping=True)

SessionLocal = sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False, autoflush=False
)

Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession]:
    db: AsyncSession = SessionLocal()

    try:
        yield db
    except Exception:
        await db.rollback()  # rollback if error on route
        raise
    finally:
        await db.close()  # close session automatically when request completed


async def init_db(session: AsyncSession) -> None:
    import app.models

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    query = (
        select(app.models.Account)
        .options(noload(app.models.Account.conversations))
        .where(app.models.Account.email == settings.APP_FIRST_SUPERUSER_EMAIL)
    )
    result = await session.execute(query)
    account = result.scalar_one_or_none()

    if account is None:  # pragma: no branch
        from app.services import auth

        await auth.create_account(
            session=session,
            name=settings.APP_FIRST_SUPERUSER_NAME,
            email=settings.APP_FIRST_SUPERUSER_EMAIL,
            password=settings.APP_FIRST_SUPERUSER_PASSWORD,
            role=app.models.AccountRole.SYSTEM,
        )
