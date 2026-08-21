import boto3
import time
import logging
import os

from dotenv import load_dotenv
from botocore.client import BaseClient
from botocore.exceptions import ClientError
from pydantic import (
    BaseModel,
    Field
)

class TripMetrics(BaseModel):
    input_tokens:   int
    output_tokens:  int
    total_tokens:   int
    execution_time: float

class TripRecommendation(BaseModel):
    success:        bool
    markdown:       str | None = Field(default=None)
    error:          str | None = Field(default=None)
    metrics:        TripMetrics | None = Field(default=None)

logger = logging.getLogger("bedrock_logger")
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Load environment variables from .env
load_dotenv()

# Define configuration variabel at module level as default value
AWS_BEARER_TOKEN_BEDROCK = os.getenv("AWS_BEARER_TOKEN_BEDROCK")
AWS_REGION = os.getenv("AWS_REGION", "ap-southeast-2")
AWS_BEDROCK_MODEL_ID = os.getenv("AWS_BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")
AWS_BEDROCK_TEMPERATURE = float(os.getenv("AWS_BEDROCK_TEMPERATURE", 0.6))
AWS_BEDROCK_TOKENS_PER_DAY = int(os.getenv("AWS_BEDROCK_TOKENS_PER_DAY", 400))
AWS_BEDROCK_MIN_TOKENS = int(os.getenv("AWS_BEDROCK_MIN_TOKENS", 1000))

# Internal helper function to determine the system persona based on the travel style
def _determine_system_persona(travel_style: str) -> str:
    """Analyzes the user's travel style and returns a tailored AI expert persona string."""
    style_lower = travel_style.lower()

    if "backpacker" in style_lower or "budget" in style_lower or "cheap" in style_lower:
        return (
            "You are a savvy, budget-conscious nomad traveler. You know all the "
            "hacks, street food treasures, free walking tours, and cheap public transit routes. "
            "Your tone is energetic, resourceful, and street-smart."
        )
    elif "luxury" in style_lower or "premium" in style_lower or "high-end" in style_lower:
        return (
            "You are a high-end luxury resort concierge. You prioritize private transfers, "
            "Michelin-starred fine dining, exclusive VIP access, and premium comfort. "
            "Your tone is elegant, professional, highly polished, and sophisticated."
        )
    elif "family" in style_lower or "kid" in style_lower or "children" in style_lower:
        return (
            "You are a patient family travel specialist. You prioritize safety, convenience, "
            "stroller-accessible routes, child-friendly activities, and spots with clean facilities. "
            "Your tone is reassuring, organized, and encouraging."
        )
    elif "food" in style_lower or "culinary" in style_lower or "eat" in style_lower:
        return (
            "You are a local culinary historian and obsessed foodie guide. You view cities "
            "through their kitchens, street stalls, and food markets. Every itinerary "
            "must revolve around exceptional meals and local delicacies. Your tone is passionate and mouth-watering."
        )

    return (
        "You are an expert, worldly travel guide planner. Your job is to balance logistics, "
        "cultural immersion, and local secrets beautifully. Your tone is inspiring and highly helpful."
    )

# Internal helper function to build the user prompt
def _build_user_prompt(destination: str, days: int, budget: float, travel_style: str) -> str:
    """
    Constructs a clean, structured string prompt containing user parameters
    and output constraints enforcing raw Markdown output.
    """
    return f"""
    Create a highly optimized, realistic travel itinerary based on these constraints:

    <trip_details>
    - Destination: {destination}
    - Duration: {days} Days
    - Budget: ${budget:,} USD total
    - Travel Style: {travel_style}
    </trip_details>

    You MUST strictly provide the output using the following Markdown structure:
    ## Trip Overview
    [Provide a 2-sentence summary matching the budget and travel style here]

    ## Estimated Budget Breakdown ({budget} USD)
    - **Accommodation**: X USD (Y%)
    - **Food & Dining**: X USD (Y%)
    - **Activities**: X USD (Y%)
    - **Transportation**: X USD (Y%)

    ## Daily Itinerary

    ### Day 1: [Day Title]
    - **Morning**:
      - [Provide a dynamic list of morning activities. Aim for 3 to 4 distinct activities as a baseline, with a strict minimum of 2 and maximum of 5 items.]
    - **Afternoon**:
      - [Provide a dynamic list of cultural sites or local experiences. Aim for 3 to 4 recommendations as a baseline, with a strict minimum of 2 and maximum of 5 items.]
    - **Evening**:
      - [Provide a dynamic list of dinner spots or nightlife options. Aim for 3 to 4 recommendations as a baseline, with a strict minimum of 2 and maximum of 5 items.]

    ### Day 2: [Day Title]
    - **Morning**:
      - [Provide a dynamic list of morning activities. Aim for 3 to 4 distinct activities as a baseline, with a strict minimum of 2 and maximum of 5 items.]
    ... repeat for all {days} days.

    ## Travel Tips
    - [Provide list of travel tips matching the destination, budget, and travel style here]

    Strict Rules:
    - **Formatting Constraints**:
      - Use exact headers (## and ###) as specified above.
      - All activity bullets must start with a hyphen (-).
      - Do not wrap the entire response in markdown code blocks (like ```markdown ... ```).
      - Start directly with the "## Trip Overview" header. No conversational pleasantries.
    - **Dynamic List Constraints**:
      - For each Morning, Afternoon, and Evening slot, you must generate a flexible bulleted list.
      - The number of bullets per slot MUST be between 2 to 5 items. Fewer than 2 or more than 5 items is strictly forbidden.
      - Do not default to exactly 2 items for every slot. Aim for 3 or 4 items as your baseline anchor.
      - Dynamically scale the list length based on the 'Travel Style' (e.g., provide 4-5 items for action-packed styles, and 2-3 items for relaxed or slow travel styles).
    """

def get_bedrock_client() -> BaseClient:
    """
    Initializes a Boto3 Bedrock Runtime client.
    Boto3 automatically picks up AWS_BEARER_TOKEN_BEDROCK from the environment.
    """
    # Optional safety check to prevent obscure runtime errors later
    if not AWS_BEARER_TOKEN_BEDROCK:
        raise ValueError("AWS_BEARER_TOKEN_BEDROCK is missing from the environment or .env file.")

    return boto3.client(service_name="bedrock-runtime", region_name=AWS_REGION
    )

def get_ai_recommendation(
    destination: str,
    days: int,
    budget: float,
    travel_style: str,
    model_id: str = AWS_BEDROCK_MODEL_ID,
    temperature: float = AWS_BEDROCK_TEMPERATURE,
    tokens_per_day: int = AWS_BEDROCK_TOKENS_PER_DAY,
    min_tokens: int = AWS_BEDROCK_MIN_TOKENS
) -> TripRecommendation:
    """
    Generates a travel itinerary using a clean, modular structure with
    pre-loaded configurations and override capabilities.
    Returns a structured dictionary containing the text result, token metrics, and performance analytics.
    """

    start_time = time.time()
    logger.info(f"Starting Bedrock inference for: '{destination}' using model: '{model_id}'")
    try:
        client = get_bedrock_client()

        # Calculate maxTokens dynamically based on active parameter value
        maxTokens = (days * tokens_per_day) + min_tokens

        # Setup system configuration and generate the user prompt via helpers
        system_config = [{"text": _determine_system_persona(travel_style)}]
        user_prompt = _build_user_prompt(destination, days, budget, travel_style)

        # Package payloads cleanly
        messages = [{"role": "user", "content": [{"text": user_prompt}]}]
        inference_config = {"temperature": temperature, "maxTokens": maxTokens}

        # Call the API
        response = client.converse(
            modelId=model_id,
            messages=messages,
            system=system_config,
            inferenceConfig=inference_config
        )

        # Get execution time
        execution_time = round(time.time() - start_time, 2)

        # Get token usage statistic from Bedrock metadata object
        usage = response.get("usage", {})

        # Defensif extraction, prevent crash if there's a non-text element
        output_message = response["output"]["message"]
        text_parts = [
            block["text"]
            for block in output_message["content"]
            if "text" in block
        ]
        markdown = "\n".join(text_parts)
        metrics = TripMetrics(
            input_tokens = usage.get("inputTokens", 0),
            output_tokens = usage.get("outputTokens", 0),
            total_tokens = usage.get("totalTokens", 0),
            execution_time = execution_time
        )

         # Write metric to applicationn system log
        logger.info(
            f"Bedrock Success | Latency: {execution_time}s | "
            f"Input Tokens: {metrics.input_tokens} | Output Tokens: {metrics.output_tokens} | Total Tokens: {metrics.total_tokens}"
        )

        return TripRecommendation(
            success = True,
            markdown = markdown,
            metrics = metrics
        )
    except ClientError as e:
        error_msg = e.response['Error']['Message']
        logger.error(f"Bedrock ClientError: {error_msg}")
        return TripRecommendation(success=False, error=f"API Error: {error_msg}")
    except Exception as e:
        logger.error(f"Bedrock Unexpected Error: {str(e)}")
        return TripRecommendation(success=False, error=str(e))
