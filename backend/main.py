from logging import getLogger
from os import getenv
from time import sleep
from uuid import UUID

from database import get_db, init_db
from fastapi import (
    BackgroundTasks,
    Depends,
    FastAPI,
    HTTPException,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from models.trip import Trip
from models.user import User
from models.conversation import Conversation
from models.message import Message
from services.auth_service import (
    LoginRequest,
    RegisterRequest,
    login_user,
    register_user,
    get_current_user
)
from services.bedrock_service import (
    _build_user_prompt,
    _determine_system_persona,
)
from services.kb_service import (
    AskRequest,
    AskResponse,
    retrieve_and_generate,
)
from services.trip_service import (
    TripRequest,
    TripSearchPage,
    TripSearchRequest,
    TripUpdate,
    get_recommended_transports,
    get_trip_categories,
    update_trip_details,
)
from services.conversation_service import (
    CreateConversationRequest,
    SearchConversationRequest,
    UpdateConversationRequest,
    CreateMessageRequest
)
from sqlalchemy import (
    any_,
    desc,
    func,
    literal,
    or_,
    select,
)
from sqlalchemy.orm import (
    Session,
    defer,
    joinedload,
    noload,
)
from tasks.trip import generate_recommendation
from tasks.chat import generate_chat_answer

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        getenv("FRONTEND_URL")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
logger = getLogger("app_logger")

init_db()

# a GET endpoint at the root path
@app.get("/")
def home():
    return {
        "message": "Welcome to KelanaAI"
    }

@app.get("/health")
def health():
    return {
        "status": "OK"
    }

@app.get("/api/v1/trip-categories")
def categories():
    return get_trip_categories()

@app.get("/api/v1/transportations")
def transports():
    return get_recommended_transports()

@app.get("/api/v1/trips", status_code= status.HTTP_200_OK)
def list_trips(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    data = db.query(Trip).options(defer(Trip.recommendation)).filter(Trip.user_id == current_user.id).all()
    total = db.scalar(select(func.count()).select_from(Trip).where(Trip.user_id == current_user.id))

    return { "data": data, "total": total }

@app.post("/api/v1/trips", status_code= status.HTTP_201_CREATED)
def create_trip(request: TripRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        trip = Trip(
            user_id           = current_user.id,
            destination       = request.destination,
            days              = request.days,
            budget            = request.budget,
            travel_style      = request.travel_style or []
        )
        update_trip_details(trip)

        db.add(trip)
        db.commit()
        db.refresh(trip)

        return trip
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to create Trip")

@app.get("/api/v1/trips/{trip_id}", status_code= status.HTTP_200_OK)
def get_trip(trip_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()

        if trip is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip with id {trip_id} not found")

        return trip
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to get Trip with id {trip_id}")

@app.put("/api/v1/trips/{trip_id}", status_code= status.HTTP_200_OK)
def update_trip(
    trip_id: UUID,
    payload: TripUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
    ):
    try:
        trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()

        if trip is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip with id {trip_id} not found")

        # update new trip data
        update = payload.model_dump(exclude_unset=True)
        for key, value in update.items():
            setattr(trip, key, value)

        # recalculate details based on updated trip
        update_trip_details(trip)

        # update recommendation if it's already set
        if trip.recommendation is None:
            db.commit()
        elif not trip.processing:
            background_tasks.add_task(generate_recommendation, trip.id)

        return trip
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to update Trip with id {trip_id}")

@app.delete("/api/v1/trips/{trip_id}", status_code= status.HTTP_204_NO_CONTENT)
def delete_trip(trip_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()

        if trip is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip with id {trip_id} not found")

        db.delete(trip)
        db.commit()
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to delete Trip with id {trip_id}")

@app.post("/api/v1/trips/{trip_id}/generate", status_code= status.HTTP_202_ACCEPTED)
def generate_trip(trip_id: UUID, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()
        if trip is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip with id {trip_id} not found")

        if trip.processing:
            return {
                "id": trip.id,
                "processing": True,
                "message": "The itinerary is being processed in the background.",
            }

        background_tasks.add_task(generate_recommendation, trip.id)

        return {
            "id": trip.id,
            "processing": True,
            "message": "The itinerary is being processed in the background.",
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to generate Trip recommendation with id {trip_id}")

@app.post("/api/v1/trips/{trip_id}/status", status_code=status.HTTP_200_OK)
async def status_trip(trip_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == current_user.id).first()

        if trip is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Trip with id {trip_id} not found")

        if trip.processing:
            return {
                "id": trip.id,
                "processing": True,
                "message": "The itinerary is being processed in the background."
            }
        elif not trip.recommendation is None:
            return {
                "id": trip.id,
                "processing": False,
                "recommendation": trip.recommendation
            }
        else:
            return {
                "id": trip.id,
                "processing": False,
                "message": "The itinerary has not been processed",
            }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to get trip status with id {trip_id}.")

@app.post("/api/v1/search/trips", status_code=status.HTTP_200_OK)
async def search_trip(request: TripSearchRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        search = request.search.lower()

        query = db.query(Trip).options(defer(Trip.recommendation)).filter(Trip.user_id == current_user.id)

        if search != "":
            if (request.filter is None or (request.filter.destination == request.filter.style)) :
                query = query.filter(or_(Trip.destination.ilike(f"%{search}%"), literal(search).ilike(any_(Trip.travel_style))))
            else:
                if (request.filter.destination):
                    query = query.filter(Trip.destination.ilike(f"%{search}%"))

                if (request.filter.style):
                    query = query.filter(literal(search).ilike(any_(Trip.travel_style)))

        total = query.with_entities(func.count()).scalar()

        page = TripSearchPage(index=1, size=10) if request.page is None else request.page
        offset = (page.index - 1) * page.size
        query = query.order_by(desc(Trip.created_at)).limit(page.size).offset(offset)

        trip = query.all()

        return { "data": [] if trip is None else trip, "total": total }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to get search trips. {e}")

@app.post("/api/v1/ask", response_model=AskResponse, response_model_exclude_none=True)
def ask(request: AskRequest) -> AskResponse: # , current_user = Depends(get_current_user)):
    try:
        return retrieve_and_generate(request.question, request.with_kb or False)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.get("/api/v1/conversations", status_code=status.HTTP_200_OK)
def get_conversations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return search_conversations(None, db, current_user);

@app.post("/api/v1/search/conversations", status_code=status.HTTP_200_OK)
def search_conversations(request: SearchConversationRequest | None = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        query = db.query(Conversation).filter(Conversation.user_id == current_user.id)
        total = query.with_entities(func.count()).scalar()

        if total == 0:
            return { "data": [], "total": total }

        if not request is None:
            title = (request.title or "").lower()
            if title != "":
                query = query.filter(Conversation.title.ilike(f"%{title}%"))

            page = TripSearchPage(index=1, size=10) if request.page is None else request.page
            offset = (page.index - 1) * page.size
            query = query.order_by(desc(Conversation.created_at)).limit(page.size).offset(offset)

        conv = query.all()

        return { "data": [] if conv is None else conv, "total": total }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to get conversation. {e}")

@app.post("/api/v1/conversations", status_code= status.HTTP_201_CREATED)
def create_conversations(request: CreateConversationRequest | None = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        conv = Conversation(
            user_id     = current_user.id,
            title       = (request and request.title and request.title.strip()) or None
        )

        db.add(conv)
        db.commit()
        db.refresh(conv)

        return conv
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to create Conversation: {e}")

@app.get("/api/v1/conversations/{id}", status_code= status.HTTP_200_OK)
def get_conversation(id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        conv = db.query(Conversation).options(joinedload(Conversation.messages)).filter(Conversation.id == id, Conversation.user_id == current_user.id).first()

        if conv is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Conversation with id {id} not found")

        return conv
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to get Conversation with id {id}")

@app.put("/api/v1/conversations/{id}", status_code= status.HTTP_200_OK)
def update_conversation(
    id: UUID,
    request: UpdateConversationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
    ):
    try:
        conv = db.query(Conversation).filter(Conversation.id == id, Conversation.user_id == current_user.id).first()

        if conv is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Conversation with id {id} not found")

        conv.title = request.title or None
        db.commit()
        db.refresh(conv)

        return conv
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to update Conversation with id {id}")

@app.delete("/api/v1/conversations/{id}", status_code= status.HTTP_204_NO_CONTENT)
def delete_conversation(id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        conv = db.query(Conversation).filter(Conversation.id == id, Conversation.user_id == current_user.id).first()

        if conv is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Conversation with id {id} not found")

        db.delete(conv)
        db.commit()
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to delete Conversation with id {id}")

@app.post("/api/v1/conversations/{id}/messages", status_code=status.HTTP_201_CREATED)
def create_conversation_message(
    id: UUID, request: CreateMessageRequest,
    tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        conv = db.query(Conversation).filter(Conversation.id == id, Conversation.user_id == current_user.id).first()

        if conv is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Conversation with id {id} not found")

        role = request and request.role
        content    = request and request.content

        if role == "" or content == "":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid role or content")

        mesg = Message(
            id              = request.id or None,
            conversation_id = conv.id,
            role            = role,
            content         = content,
        )

        db.add(mesg)
        db.commit()
        db.refresh(mesg)

        if mesg.role == "user":
            tasks.add_task(generate_chat_answer, mesg.conversation_id)

        return mesg
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to create message for conversation with id {id}")

@app.get("/api/v1/conversations/{id}/status", status_code= status.HTTP_200_OK)
def get_conversation(id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        conv = db.query(Conversation).options(noload(Conversation.messages)).filter(Conversation.id == id, Conversation.user_id == current_user.id).first()

        if conv is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Conversation with id {id} not found")

        if conv.pending:
            return {
                "id": id,
                "pending": True,
                "message": "The itinerary is being processed in the background."
            }
        else:
            message = db.query(Message).filter(
                Message.conversation_id == id,
                Message.role == "assistant",
            ).order_by(
                Message.created_at.desc(),
            ).first()

            if message is None:
                return {
                    "id": id,
                    "pending": True,
                    "message": "The itinerary is being processed in the background."
                }

            return {
                "id": id,
                "pending": False,
                "role": message.role,
                "content": message.content,
                "created_at": message.created_at,
            }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to get Conversation status with id {id}")


@app.post("/api/v1/auth/register", status_code=201)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    try:
        user = register_user(
            db       = db,
            name     = request.name,
            email    = request.email,
            password = request.password,
        )
        return {
            "id":         user.id,
            "name":       user.name,
            "email":      user.email,
            "created_at": user.created_at,
        }
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))

@app.post("/api/v1/auth/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    try:
        return login_user(db=db, email=request.email, password=request.password)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.post("/api/v1/auth/logout")
def logout(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        # Nothing todo at backend side
        return True
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.post("/api/v1/auth/me")
def me(current_user: User = Depends(get_current_user)):
    try:
        return current_user
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

@app.post("/api/v1/debug/echo", status_code= status.HTTP_200_OK)
def echo(request: TripRequest):
    try:
        trip = Trip(
            destination       = request.destination,
            days              = request.days,
            budget            = request.budget,
            travel_style      = request.travel_style or []
        )
        update_trip_details(trip)

        # simulate long running process
        sleep(5)

        return trip
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to create Trip")

@app.post("/api/v1/debug/persona", status_code= status.HTTP_200_OK)
def persona(travel_style: list[str] | None):
    try:
        return _determine_system_persona(travel_style or [])
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"{e}")

@app.post("/api/v1/debug/prompt", status_code= status.HTTP_200_OK)
def prompt(request: TripRequest):
    try:
        return _build_user_prompt(request.destination, request.days, request.budget, request.travel_style or [])
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"{e}")
