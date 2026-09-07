from os import getenv

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Load .env so os.getenv() can read it
load_dotenv()

# Connection string from .env - never hardcode secrets
DATABASE_URL = getenv("DATABASE_URL")

# engine = the connection pool
engine = create_engine(DATABASE_URL)

# SessionLocal = a factory for DB sessions
SessionLocal = sessionmaker(bind=engine, autoflush=False)


# Create db session
def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()  # rollback if error on route
        raise
    finally:
        db.close()  # close session automatically when request completed
