from pytest import raises
from sqlalchemy import inspect
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.db import (
    get_db,
    init_db,
)


def test_init_db_creates_user(test_engine: Engine, db_session: Session):
    """Inspect the test database to confirm tables exist."""

    inspector = inspect(test_engine)
    expected = ["conversation", "message", "metric", "trip", "account"]
    actual = inspector.get_table_names()

    assert len(actual) >= len(expected)
    assert set(expected).issubset(set(actual))

    init_db(db_session)

    from app.models.account import Account

    admins = db_session.query(Account).filter(Account.admin).all()
    assert len(admins) == 1
    assert admins[0].email == settings.APP_FIRST_SUPERUSER_EMAIL


def test_get_db_yields_session():
    """Ensure that `get_db` yields a session and closes it at the end."""

    generator = get_db()
    db_session = next(generator)
    assert isinstance(db_session, Session)

    with raises(StopIteration):
        next(generator)


def test_get_db_rolls_back_on_exception(mocker):
    """Ensure that `get_db` performs a rollback if an exception occurs
    within the try block."""

    mock_session_local = mocker.patch("app.core.db.SessionLocal")
    mock_db = mocker.MagicMock()
    mock_session_local.return_value = mock_db

    generator = get_db()
    _ = next(generator)

    with raises(ValueError, match="Dummy error"):
        generator.throw(ValueError("Dummy error"))

    mock_db.rollback.assert_called_once()
    mock_db.close.assert_called_once()
