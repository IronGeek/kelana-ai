from collections.abc import (
    AsyncGenerator,
    Generator,
)

from httpx import (
    ASGITransport,
    AsyncClient,
)
from pytest_asyncio import fixture
from sqlalchemy import (
    event,
    select,
)
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    create_async_engine,
)
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.core.db import (
    Base,
    get_db,
)
from app.main import app
from app.models.account import (
    Account,
    AccountRole,
)
from app.services.auth import hash_password


@fixture(scope="session", autouse=True)
async def test_engine() -> AsyncGenerator[AsyncEngine]:
    """Create the database engine once for the entire testing session."""
    engine = create_async_engine(str(settings.TEST_DATABASE_URL), pool_pre_ping=True)

    # Tell SQLAlchemy to force all test tables to be UNLOGGED (In-Memory Speed)
    @event.listens_for(Base.metadata, "before_create")
    def insert_unlogged(target, connection, **kw):
        for table in target.tables.values():
            table._prefixes.append("UNLOGGED")

    # Import all our models
    from app.models import (  # noqa: F401
        account,
        conversation,
        message,
        metric,
        trip,
    )

    # Clean out any old test data and build fresh tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    # Clean up tables when all tests finish
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@fixture(scope="function")
async def db_session(test_engine) -> AsyncGenerator[AsyncSession]:
    """Provides a new, isolated database session for each test function.."""

    TestingSessionLocal = sessionmaker(
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
        bind=test_engine,
    )
    session = TestingSessionLocal()

    try:
        yield session
    finally:
        # Roll back or clean up data after the test function completes
        # to avoid polluting other tests
        await session.rollback()
        await session.close()


@fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient]:
    # Trik penting: Override dependency get_db FastAPI agar menggunakan DB Testing
    async def _override_get_db():
        try:
            yield db_session
        finally:
            await db_session.close()

    app.dependency_overrides[get_db] = _override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://testserver"
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


@fixture(scope="function")
def test_password() -> Generator[str]:
    return "12345678"


@fixture(scope="function")
async def default_user(
    db_session: AsyncSession, test_password: str
) -> AsyncGenerator[Account]:
    """Default user account."""

    user = Account(
        name="Alice Smith",
        email="alice@example.com",
        password_hash=hash_password(test_password),
        role=AccountRole.USER,
    )
    try:
        db_session.add(user)
        await db_session.flush()
    except IntegrityError:
        await db_session.rollback()
        user = await db_session.scalar(
            select(Account).where(Account.email == user.email)
        )

    return user


@fixture(scope="function")
async def system_user(
    db_session: AsyncSession, test_password: str
) -> AsyncGenerator[Account]:
    """System user account."""

    user = Account(
        name="John Wick",
        email="john@example.com",
        password_hash=hash_password(test_password),
        role=AccountRole.SYSTEM,
    )
    try:
        db_session.add(user)
        await db_session.flush()
    except IntegrityError:
        await db_session.rollback()
        user = await db_session.scalar(
            select(Account).where(Account.email == user.email)
        )

    return user


@fixture(scope="function")
async def admin_user(
    db_session: AsyncSession, test_password: str
) -> AsyncGenerator[Account]:
    """System user account."""

    user = Account(
        name="Jack Sparrow",
        email="jack@example.com",
        password_hash=hash_password(test_password),
        role=AccountRole.ADMIN,
    )
    db_session.add(user)

    try:
        await db_session.flush()
    except IntegrityError:
        await db_session.rollback()
        user = await db_session.scalar(
            select(Account).where(Account.email == user.email)
        )

    return user
