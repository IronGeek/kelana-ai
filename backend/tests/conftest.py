from pytest import fixture
from sqlalchemy import (
    create_engine,
    event,
)
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.core.db import Base


@fixture(scope="session")
def test_engine():
    """Create the database engine once for the entire testing session."""
    engine = create_engine(str(settings.TEST_DATABASE_URL))

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
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)

    yield engine

    # Clean up tables when all tests finish
    Base.metadata.drop_all(bind=engine)


@fixture(scope="function")
def db_session(test_engine):
    """Provides a new, isolated database session for each test function.."""

    TestingSessionLocal = sessionmaker(
        autocommit=False, autoflush=False, bind=test_engine
    )
    session = TestingSessionLocal()

    try:
        yield session
    finally:
        # Roll back or clean up data after the test function completes
        # to avoid polluting other tests
        session.rollback()
        session.close()
