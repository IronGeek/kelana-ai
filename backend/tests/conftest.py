from os import getenv

from pytest import fixture
from sqlalchemy import (
    create_engine,
    event,
)

from app.models import Base

TEST_DATABASE_URL = getenv("TEST_DATABASE_URL")


@fixture(scope="session")
def test_engine():
    """Membuat database engine satu kali untuk seluruh sesi pengujian."""
    engine = create_engine(TEST_DATABASE_URL)

    # Tell SQLAlchemy to force all test tables to be UNLOGGED (In-Memory Speed)
    @event.listens_for(Base.metadata, "before_create")
    def insert_unlogged(target, connection, **kw):
        for table in target.tables.values():
            table._prefixes.append("UNLOGGED")

    # Clean out any old test data and build fresh tables
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)

    yield engine

    # Clean up tables when all tests finish
    Base.metadata.drop_all(bind=engine)
