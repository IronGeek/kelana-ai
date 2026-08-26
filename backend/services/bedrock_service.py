from os import getenv
from time import time
from dotenv import load_dotenv
from boto3 import client
from botocore.client import BaseClient
from botocore.exceptions import ClientError
from typing import (
    Dict,
    List,
    Tuple
)
from re import (
    findall,
    escape
)
from pydantic import (
    BaseModel,
    Field
)
from logging import (
    getLogger,
    basicConfig,
    INFO
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

logger = getLogger("bedrock_logger")
basicConfig(level=INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Load environment variables from .env
load_dotenv()

# Define configuration variabel at module level as default value
AWS_BEARER_TOKEN_BEDROCK = getenv("AWS_BEARER_TOKEN_BEDROCK")
AWS_REGION = getenv("AWS_REGION", "ap-southeast-2")
AWS_BEDROCK_MODEL_ID = getenv("AWS_BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")
AWS_BEDROCK_TEMPERATURE = float(getenv("AWS_BEDROCK_TEMPERATURE", 0.6))
AWS_BEDROCK_TOKENS_PER_DAY = int(getenv("AWS_BEDROCK_TOKENS_PER_DAY", 400))
AWS_BEDROCK_MIN_TOKENS = int(getenv("AWS_BEDROCK_MIN_TOKENS", 1000))

CORE_TRAVEL_OPERATIONAL_RULES = (
    "CORE RULES:\n"
    "1. Never hallucinate places, hotels, or restaurants. If unsure, do not recommend.\n"
    "2. Group items logically by geographical proximity to reduce transit times.\n"
    "3. Keep descriptions punchy, under 30 words per spot.\n"
    "4. Ensure your output aligns strictly with the requested JSON schema.\n"
    "5. Do not include introductory or concluding conversational filler.\n"
    "6. HIGH-LOW BLENDING: If conflicting styles appear (e.g., luxury and budget), "
    "embrace both! Provide a 'high-low' experience—mix elite, expensive highlights "
    "with gritty, hyper-local street hacks in the exact same day."
)

PERSONA_FRAGMENTS: Dict[str, str] = {
    "budget": (
        "Primary Voice: Savvy, budget-conscious nomad traveler.\n"
        "Focus: Extreme travel hacks, street food treasures, free walking tours, and cheap public transit.\n"
        "Tone: Energetic, resourceful, and street-smart."
    ),
    "luxury": (
        "Primary Voice: High-end luxury resort concierge.\n"
        "Focus: Private transfers, Michelin-starred fine dining, exclusive VIP access, and premium comfort.\n"
        "Tone: Elegant, professional, highly polished, and sophisticated."
    ),
    "family": (
        "Primary Voice: Patient family travel specialist.\n"
        "Focus: Safety, convenience, stroller-accessible routes, child-friendly spots, and clean facilities.\n"
        "Tone: Reassuring, organized, and encouraging."
    ),
    "food": (
        "Primary Voice: Local culinary historian and obsessed foodie guide.\n"
        "Focus: Regional kitchens, street stalls, hidden local food markets, and food history.\n"
        "Tone: Passionate, descriptive, and mouth-watering."
    ),
    "adventure": (
        "Primary Voice: Rugged outdoor expedition guide.\n"
        "Focus: Hiking trails, adrenaline sports, hidden nature spots, and physical safety.\n"
        "Tone: Bold, safety-conscious, and inspiring."
    )
}

DEFAULT_PERSONA = (
    "Primary Voice: Expert, worldly travel guide planner.\n"
    "Focus: Perfect balance of logistics, cultural immersion, and local secrets.\n"
    "Tone: Inspiring, professional, and highly helpful."
)

# Internal helper function to determine the system persona based on the travel style
def _determine_system_persona(travel_style: list[str]) -> str:
    """Ranks and weights overlapping travel styles based on keyword frequency."""
    style_str = ' '.join(travel_style)

    # Keyword groups used to score user intent
    keyword_mapping = {
        "budget": ["backpacker", "budget", "cheap", "low-cost", "inexpensive", "saver"],
        "luxury": ["luxury", "premium", "high-end", "five-star", "expensive", "lavish"],
        "family": ["family", "children", "kids", "couple", "toddler", "parents"],
        "food": ["food", "culinary", "restaurant", "foodie", "dining", "meals", "eat"],
        "adventure": ["adventure", "hiking", "outdoor", "active", "trekking", "climbing"]
    }

    scores: Dict[str, int] = {}

    # 1. Count occurrences using regex boundaries to prevent partial word matching
    for persona_key, keywords in keyword_mapping.items():
        score = 0
        for kw in keywords:
            # Matches the exact keyword as a complete word/phrase boundary
            matches = findall(rf"\b{escape(kw)}", style_str)
            score += len(matches)

        if score > 0:
            scores[persona_key] = score

    # 2. Sort the matched categories descending by their calculated frequency score
    sorted_personas: List[Tuple[str, int]] = sorted(scores.items(), key=lambda item: item[1], reverse=True)

    #  FIXED LINE:
    sorted_personas: List[Tuple[str, int]] = sorted(scores.items(), key=lambda item: item[1], reverse=True)

    # 3. Construct the dynamic blended persona instructions
    if sorted_personas:
        persona_strings: List[str] = []
        for index, (persona_key, score) in enumerate(sorted_personas):
            fragment = PERSONA_FRAGMENTS[persona_key]

            # Label the top-scored match explicitly for the LLM
            if index == 0:
                header = f"## DOMINANT TRAVEL FOCUS (Weight: {score} matches)\n"
            else:
                header = f"## SECONDARY TRAVEL CONTEXT (Weight: {score} matches)\n"
                # Downgrade voice authority on supporting traits to avoid contradictory tone fights
                fragment = fragment.replace("Primary Voice:", "Supporting Tone Adjustment:")

            persona_strings.append(f"{header}{fragment}")

        combined_persona = "\n\n".join(persona_strings)
    else:
        combined_persona = f"## CORE TRAVEL FOCUS\n{DEFAULT_PERSONA}"

    # 4. Assemble the final unified system configuration payload
    final_prompt = (
        f"SYSTEM INSTRUCTIONS:\n"
        f"You are an AI travel assistant customized for this trip.\n\n"
        f"{combined_persona}\n\n"
        f"{CORE_TRAVEL_OPERATIONAL_RULES}"
    )

    return final_prompt

# Internal helper function to build the user prompt
def _build_user_prompt_DEPRECATED(destination: str, days: int, budget: float, travel_style: str) -> str:
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

def _build_user_prompt(destination: str, days: int, budget: float, travel_style: list[str]) -> str:
    """
    Constructs a robust, structured string prompt containing user parameters
    and strict output constraints enforcing raw high-low blended Markdown output.
    """
    return f"""
    Create a highly optimized, realistic travel itinerary based on these constraints:

    <trip_details>
    - Destination: {destination}
    - Duration: {days} Days
    - Budget: ${budget:,} USD total
    - Travel Style: {', '.join(word.capitalize() for word in travel_style)}
    </trip_details>

    You MUST strictly provide the output using the following Markdown structure:

    ## Trip Overview
    [Provide a 2-sentence summary matching the budget and travel style here]

    ## Estimated Budget Breakdown (${budget:,} USD)
    - **Accommodation**: X USD (Y%)
    - **Food & Dining**: X USD (Y%)
    - **Activities**: X USD (Y%)
    - **Transportation**: X USD (Y%)

    ## Daily Itinerary

    ### Day 1: [Day Title]
    - **Morning**:
      - [Item 1]
      - [Item 2]
    - **Afternoon**:
      - [Item 1]
      - [Item 2]
    - **Evening**:
      - [Item 1]
      - [Item 2]

    [CRITICAL: You must explicitly write out the full schedule for every single day sequentially from Day 1 up to Day {days}. Do not use ellipses or skip days.]

    ## Travel Tips
    - [Provide list of travel tips matching the destination, budget, and travel style here]

    Strict Structural Rules:
    1. **High-Low Blending Labels**:
       - For every activity, attraction, or restaurant recommended, you MUST prefix the bullet point with either the 💰 `[Save]` tag or the 💎 `[Splurge]` tag.
       - Example: "- 💎 **Dinner**: Dine at [Michelin Restaurant Name]"
       - Example: "- 💰 **Transit**: Catch the local night market commuter bus"
       - Embrace contrasting lifestyles! Mix high-end luxury with hyper-local budget hacks back-to-back within the exact same day.

    2. **Activity Count Safety Rails**:
       - For each Morning, Afternoon, and Evening block, you must output a minimum of 1 and a maximum of 3 distinct bullet items.
       - Generating more than 3 items per time block is strictly forbidden (to prevent unrealistic traveler fatigue).

    3. **Markdown Architecture Formatting**:
       - Use exact headers (## and ###) as mapped out in the structural blueprint above.
       - All activity items must start cleanly with a hyphen (-).
       - Do not wrap the entire response payload inside markdown code blocks (such as ```markdown ... ```).
       - Open the text response stream directly with the "## Trip Overview" header string. Do not include introductory pleasantries or assistant banter.
    """

def get_bedrock_client() -> BaseClient:
    """
    Initializes a Boto3 Bedrock Runtime client.
    Boto3 automatically picks up AWS_BEARER_TOKEN_BEDROCK from the environment.
    """
    # Optional safety check to prevent obscure runtime errors later
    if not AWS_BEARER_TOKEN_BEDROCK:
        raise ValueError("AWS_BEARER_TOKEN_BEDROCK is missing from the environment or .env file.")

    return client(service_name="bedrock-runtime", region_name=AWS_REGION
    )

def get_ai_recommendation(
    destination: str,
    days: int,
    budget: float,
    travel_style: list[str],
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

    start_time = time()
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
        execution_time = round(time() - start_time, 2)

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
