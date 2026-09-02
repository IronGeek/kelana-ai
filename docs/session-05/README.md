# Session 5
   
Teaching KelanaAI to Think with AI:

## Assignments

- [x] Add new dependencies
  - [x] boto3
- [x] Integration with Amazon Bedrock
  - [x] Add Bearer token, region and model configuration
  - [x] Implement Bedrock Runtime client and service (`backend/services/bedrock_service.py`)
- [x] Membuat Richer AI Prompt (`backend/services/bedrock_service.py`) 
  - [x] Improve prompt sent to Amazon, instruct AI to generate a structured daily plan with the following mandatory criteria:
    - [x] Morning activities: Ask AI to specifically provide 2-3 morning activities per day.
    - [x] Afternoon activities: Instruct the AI ​​to include recommendations for cultural sites and local experiences.
    - [x] Evening activities: Add suggestions for dinner spots and nightlife.
- [x] Saving AI Recommendations to PostgreSQL (Persistence Layer)
  - [x] Added `ai_recommendation = Column(Text, nullable=True)` column to the database model (`models/trip.py`).
  - [x] Save the itinerary from the enhanced AI response into the `ai_recommendation` column.
- [x] Menambahkan AI recommendation endpoint (backend/main.py)
  - [x] Endpoint: `POST /api/v1/trips/{id}/generate`
- [x] Testing via Swagger UI
  - [x] Run local server with `uvicorn`
  - [x] Open Swagger UI at http://localhost:8000/docs.
  - [x] Request to the endpoint `POST /api/v1/trips/{id}/generate` for one of the existing trips.
  - [x] Successful response and new AI recommendations are successfully saved in the database.
- [x] Additionals Features
  - [x] Record tokens and execution metrics
    - [x] Added `input_tokens`, `output_tokens`, `total_tokens` columns in the database
    - [x] Add `execution_time` column in database
    - [x] Read token usage and record execution time for each call to the `get_ai_recommendation` function.
  - [x] Generate AI recommendations using background tasks.
  - [x] Added endpoint for polling background task status `GET /api/v1/recommendation/{id}`

## Repository

https://github.com/IronGeek/kelana-ai/commits/session-5
