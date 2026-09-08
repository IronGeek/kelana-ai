from collections.abc import Generator

from sqlalchemy import (
    create_engine,
)
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import (
    Session,
    declarative_base,
    noload,
    sessionmaker,
)

from app.core.config import settings

engine = create_engine(str(settings.APP_DATABASE_URL), pool_pre_ping=True)

SessionLocal = sessionmaker(bind=engine, autoflush=False)

Base = declarative_base()


def get_db() -> Generator[Session]:
    db = SessionLocal()

    try:
        yield db
    except Exception:
        db.rollback()  # rollback if error on route
        raise
    finally:
        db.close()  # close session automatically when request completed


def init_db(session: Session) -> None:
    from app.models.account import Account

    try:
        session.query(Account).options(noload(Account.conversations)).where(
            Account.email == settings.APP_FIRST_SUPERUSER_EMAIL
        ).one()

    except NoResultFound:
        from app.services import auth

        auth.create_account(
            session=session,
            name=settings.APP_FIRST_SUPERUSER_NAME,
            email=settings.APP_FIRST_SUPERUSER_EMAIL,
            password=settings.APP_FIRST_SUPERUSER_PASSWORD,
            admin=True,
        )
