from json import dumps
from os import path
from re import (
    escape,
    findall,
)
from time import time
from urllib.parse import unquote, urlparse
from uuid import UUID

from boto3 import Session
from botocore.client import BaseClient
from botocore.exceptions import ClientError

from app.core.config import settings
from app.schemas.bedrock import (
    AIAskResponse,
    AIChatResponse,
    AIRecommendation,
    AskAnswer,
    AskSources,
    ChatAnswer,
    ChatHistory,
)
from app.schemas.metric import MetricRequest
from app.services.metric import save_metric

CORE_TRAVEL_OPERATIONAL_RULES = (
    "CORE RULES:\n"
    "1. Never hallucinate places, hotels, restaurants. If unsure, do not recommend.\n"
    "2. Group items logically by geographical proximity to reduce transit times.\n"
    "3. Keep descriptions punchy, under 30 words per spot.\n"
    "4. Ensure your output aligns strictly with the requested JSON schema.\n"
    "5. Do not include introductory or concluding conversational filler.\n"
    "6. HIGH-LOW BLENDING: If conflicting styles appear (e.g., luxury and budget), "
    "embrace both! Provide a 'high-low' experience—mix elite, expensive highlights "
    "with gritty, hyper-local street hacks in the exact same day."
)

PERSONA_FRAGMENTS: dict[str, str] = {
    "budget": (
        "Primary Voice: Savvy, budget-conscious nomad traveler.\n"
        "Focus: Extreme travel hacks, street food treasures, free walking tours, "
        "and cheap public transit.\n"
        "Tone: Energetic, resourceful, and street-smart."
    ),
    "luxury": (
        "Primary Voice: High-end luxury resort concierge.\n"
        "Focus: Private transfers, Michelin-starred fine dining, exclusive VIP access, "
        "and premium comfort.\n"
        "Tone: Elegant, professional, highly polished, and sophisticated."
    ),
    "family": (
        "Primary Voice: Patient family travel specialist.\n"
        "Focus: Safety, convenience, stroller-accessible routes, child-friendly spots, "
        "and clean facilities.\n"
        "Tone: Reassuring, organized, and encouraging."
    ),
    "food": (
        "Primary Voice: Local culinary historian and obsessed foodie guide.\n"
        "Focus: Regional kitchens, street stalls, hidden local food markets, and food "
        "history.\n"
        "Tone: Passionate, descriptive, and mouth-watering."
    ),
    "adventure": (
        "Primary Voice: Rugged outdoor expedition guide.\n"
        "Focus: Hiking trails, adrenaline sports, hidden nature spots, and physical "
        "safety.\n"
        "Tone: Bold, safety-conscious, and inspiring."
    ),
}

DEFAULT_PERSONA = (
    "Primary Voice: Expert, worldly travel guide planner.\n"
    "Focus: Perfect balance of logistics, cultural immersion, and local secrets.\n"
    "Tone: Inspiring, professional, and highly helpful."
)


def _get_source_uri(location: dict) -> str | None:
    if not location:
        return None

    location_type = location.get("type")
    if not location_type:
        return None

    source = location.get(f"{location_type.lower()}Location", {})
    return source.get("uri") or source.get("url")


def _get_document_title(result: dict, source_uri: str | None) -> str:
    metadata = result.get("metadata", {})

    for key in ("title", "document_title", "documentTitle", "file_name", "filename"):
        if metadata.get(key):
            return str(metadata[key])

    if source_uri:
        source_path = urlparse(source_uri).path
        filename = path.basename(unquote(source_path))
        if filename:
            return filename

    return "Untitled"


# Internal helper function to determine the system persona based on the travel style
def _determine_system_persona(styles: list[str]) -> str:
    """Ranks and weights overlapping travel styles based on keyword frequency."""
    style_str = " ".join(styles)

    # Keyword groups used to score user intent
    keyword_mapping = {
        "budget": [
            "backpacker",
            "budget",
            "cheap",
            "low-cost",
            "inexpensive",
            "saver",
        ],
        "luxury": [
            "luxury",
            "premium",
            "high-end",
            "five-star",
            "expensive",
            "lavish",
        ],
        "family": [
            "family",
            "adult",
            "children",
            "kids",
            "couple",
            "toddler",
            "parents",
        ],
        "food": [
            "food",
            "culinary",
            "restaurant",
            "foodie",
            "dining",
            "meals",
            "eat",
        ],
        "adventure": [
            "adventure",
            "hiking",
            "outdoor",
            "active",
            "trekking",
            "climbing",
        ],
    }

    scores: dict[str, int] = {}

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
    sorted_personas: list[tuple[str, int]] = sorted(
        scores.items(), key=lambda item: item[1], reverse=True
    )

    #  FIXED LINE:
    sorted_personas: list[tuple[str, int]] = sorted(
        scores.items(), key=lambda item: item[1], reverse=True
    )

    # 3. Construct the dynamic blended persona instructions
    if sorted_personas:
        persona_strings: list[str] = []
        for index, (persona_key, score) in enumerate(sorted_personas):
            fragment = PERSONA_FRAGMENTS[persona_key]

            # Label the top-scored match explicitly for the LLM
            if index == 0:
                header = f"## DOMINANT TRAVEL FOCUS (Weight: {score} matches)\n"
            else:
                header = f"## SECONDARY TRAVEL CONTEXT (Weight: {score} matches)\n"
                # Downgrade voice authority on supporting traits to avoid contradictory
                # tone fights
                fragment = fragment.replace(
                    "Primary Voice:", "Supporting Tone Adjustment:"
                )

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
def _build_user_prompt_DEPRECATED(
    destination: str, days: int, budget: float, travel_style: str
) -> str:
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
    """  # noqa: E501


def _build_user_prompt(
    destination: str, days: int, budget: float, styles: list[str]
) -> str:
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
    - Travel Style: {", ".join(word.capitalize() for word in styles)}
    </trip_details>

    You MUST strictly provide the output using the following Markdown structure:

    ## Trip Overview
    [Provide a 3-sentence summary matching the budget and travel style here]

    ## Estimated Budget Breakdown (${budget:,} USD)
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
       - For each Morning, Afternoon, and Evening block, you must output a minimum of 1 and a maximum of 5 distinct bullet items.
       - Generating more than 5 items per time block is strictly forbidden (to prevent unrealistic traveler fatigue).

    3. **Markdown Architecture Formatting**:
       - Use exact headers (## and ###) as mapped out in the structural blueprint above.
       - All activity items must start cleanly with a hyphen (-).
       - Do not wrap the entire response payload inside markdown code blocks (such as ```markdown ... ```).
       - Open the text response stream directly with the "## Trip Overview" header string. Do not include introductory pleasantries or assistant banter.
    """  # noqa: E501


def get_bedrock_client(service_name: str = "bedrock-runtime") -> BaseClient:
    """
    Initializes a Boto3 Bedrock Runtime client.
    Boto3 automatically picks up AWS_BEARER_TOKEN_BEDROCK from the environment.
    """
    session = Session(
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
    )

    return session.client(service_name=service_name, region_name=settings.AWS_REGION)


async def get_ai_recommendation(
    id: UUID,
    account_id: UUID,
    destination: str,
    days: int,
    budget: float,
    styles: list[str],
    model_id: str = settings.AWS_BEDROCK_MODEL_ID,
    temperature: float = settings.AWS_BEDROCK_TEMPERATURE,
    tokens_per_day: int = settings.AWS_BEDROCK_TOKENS_PER_DAY,
    min_tokens: int = settings.AWS_BEDROCK_MIN_TOKENS,
) -> AIRecommendation:
    """
    Generates a travel itinerary using a clean, modular structure with
    pre-loaded configurations and override capabilities.
    Token metrics, and performance analytics are saved at the end.
    Returns a structured dictionary containing the text result.
    """

    exec_start = time()
    metric = MetricRequest(
        correlated_id=id,
        account_id=account_id,
    )
    try:
        client = get_bedrock_client("bedrock-runtime")
        metric.service_name = (
            client.meta.service_model.service_name or "bedrock-runtime"
        )

        maxTokens = (days * tokens_per_day) + min_tokens
        inference_config = ({"temperature": temperature, "maxTokens": maxTokens},)

        system_prompt = _determine_system_persona(styles)
        metric.system = system_prompt

        user_prompt = _build_user_prompt(destination, days, budget, styles)
        metric.prompt = user_prompt

        response = client.converse(
            modelId=model_id,
            inferenceConfig=inference_config,
            system=[{"text": system_prompt}],
            messages=[{"role": "user", "content": [{"text": user_prompt}]}],
        )

        exec_time = round(time() - exec_start, 2)

        output_message = response["output"]["message"]
        text_parts = [
            block["text"] for block in output_message["content"] if "text" in block
        ]
        markdown = "\n".join(text_parts)
        metric.response = markdown

        usage = response.get("usage", {})
        if usage is not None:
            metric.input_tokens = usage.get("inputTokens", 0)
            metric.output_tokens = usage.get("outputTokens", 0)
            metric.total_tokens = usage.get("totalTokens", 0)
            metric.exec_start = exec_start
            metric.exec_time = exec_time

        metric.success = True
        await save_metric(metric)

        return AIRecommendation(success=True, markdown=markdown)
    except ClientError as e:
        metric.success = False
        metric.error = e.response["Error"]["Message"]
    except Exception as e:
        metric.success = False
        metric.error = str(e)

    await save_metric(metric)

    return AIRecommendation(success=False, error=metric.error)


async def retrieve_kb(
    id: UUID,
    account_id: UUID,
    question: str,
) -> AIAskResponse:
    exec_start = time()
    metric = MetricRequest(
        correlated_id=id,
        account_id=account_id,
    )

    sources: list[AskSources] = []
    context: str | None = None
    try:
        client = get_bedrock_client("bedrock-agent-runtime")
        metric.service_name = (
            client.meta.service_model.service_name or "bedrock-agent-runtime"
        )
        metric.prompt = question

        knowledge = client.retrieve(
            knowledgeBaseId=settings.AWS_KNOWLEDGE_BASE_ID,
            retrievalQuery={"text": question},
            retrievalConfiguration={
                "managedSearchConfiguration": {"numberOfResults": 5}
            },
        )

        # Get execution time
        exec_time = round(time() - exec_start, 2)

        results = knowledge.get("retrievalResults", [])
        chunks: list[str] = []
        seen_sources = set()

        for result in results:
            content = result.get("content", {})
            text = content.get("text", "").strip()
            if not text:
                continue

            chunks.append(text)
            location = _get_source_uri(result.get("location", {}))
            title = _get_document_title(result, location)

            if title not in seen_sources:
                seen_sources.add(title)
                sources.append(
                    AskSources(
                        title=title,
                        document_id=result.get("documentId"),
                        location=location,
                        metadata=result.get("metadata", {}),
                        score=result.get("score"),
                    )
                )

        context = "\n\n".join(chunks)
        metric.response = context

        # Get token usage statistic from Bedrock metadata object
        usage = knowledge.get("usage", {})
        if usage is not None:
            metric.input_tokens = usage.get("inputTokens", 0)
            metric.output_tokens = usage.get("outputTokens", 0)
            metric.total_tokens = usage.get("totalTokens", 0)
            metric.exec_start = exec_start
            metric.exec_time = exec_time

        metric.success = True
        await save_metric(metric)

        return AIAskResponse(
            success=True,
            data=AskAnswer(
                question=question,
                answer=context,
                sources=sources,
            ),
        )
    except ClientError as e:
        metric.success = False
        metric.error = e.response["Error"]["Message"]

    except Exception as e:
        metric.success = False
        metric.error = str(e)

    await save_metric(metric)

    return AIAskResponse(success=False, error=metric.error)


async def retrieve_and_generate(
    id: UUID,
    account_id: UUID,
    question: str,
    with_kb: bool = False,
) -> AIAskResponse:
    exec_start = time()
    metric = MetricRequest(
        correlated_id=id,
        account_id=account_id,
    )

    sources: list[AskSources] = []
    context: str = "No relevant knowledge base context found."

    if with_kb:
        kb = await retrieve_kb(
            id=id,
            account_id=account_id,
            question=question,
        )
        if kb.success:
            context = kb.data.answer
            sources = kb.data.sources

    try:
        prompt = f"""### Instructions
        Answer the question based on the provided context. If the context does not contain explicit information, you are permitted to make strict logical inferences ONLY from the given data.

        Strict Rules:
        1. Do not make assumptions or use external knowledge outside the context.
        2. Briefly explain your reasoning steps before providing the final answer.
        3. If the data is completely insufficient to make a logical conclusion, state "Insufficient data for inference."

        ### Contexts
        <context>
        {context}
        </context>

        ### Question
        <question>
        {question}
        </question>"""  # noqa: E501
        metric.prompt = prompt

        bedrock_client = get_bedrock_client("bedrock-runtime")
        metric.service_name = (
            bedrock_client.meta.service_model.service_name or "bedrock-runtime"
        )

        response = bedrock_client.converse(
            modelId=settings.AWS_BEDROCK_MODEL_ID,
            messages=[{"role": "user", "content": [{"text": prompt}]}],
        )

        # Get execution time
        exec_time = round(time() - exec_start, 2)

        output_message = response["output"]["message"]
        text_parts = [
            block["text"] for block in output_message["content"] if "text" in block
        ]
        answer = "\n".join(text_parts)
        metric.response = answer

        # Get token usage statistic from Bedrock metadata object
        usage = response.get("usage", {})
        if usage is not None:
            metric.input_tokens = usage.get("inputTokens", 0)
            metric.output_tokens = usage.get("outputTokens", 0)
            metric.total_tokens = usage.get("totalTokens", 0)
            metric.exec_start = exec_start
            metric.exec_time = exec_time

        metric.success = True
        await save_metric(metric)

        return AIAskResponse(
            success=True,
            data=AskAnswer(question=question, answer=answer, sources=sources),
        )
    except ClientError as e:
        metric.success = False
        metric.error = e.response["Error"]["Message"]
    except Exception as e:
        metric.success = False
        metric.error = str(e)

    await save_metric(metric)

    return AIAskResponse(success=False, error=metric.error)


async def get_ai_answer(
    id: UUID,
    account_id: UUID,
    history: list[ChatHistory],
    with_kb: bool = False,
    model_id: str = settings.AWS_BEDROCK_MODEL_ID,
    temperature: float = settings.AWS_BEDROCK_TEMPERATURE,
) -> AIChatResponse:
    exec_start = time()
    metric = MetricRequest(
        correlated_id=id,
        account_id=account_id,
    )

    try:
        client = get_bedrock_client("bedrock-runtime")
        metric.service_name = (
            client.meta.service_model.service_name or "bedrock-runtime"
        )

        inference_config = {"temperature": temperature}
        system_prompt = (
            "You are a helpful assistant. "
            "Always format your responses using clean Markdown. "
            "Use bolding, bullet points, headers, and code blocks where appropriate."
        )
        metric.system = system_prompt

        user_prompt = [hist.model_dump() for hist in history]
        metric.prompt = dumps(user_prompt, separators=(",", ":"))

        response = client.converse(
            modelId=model_id,
            inferenceConfig=inference_config,
            system=[{"text": system_prompt}],
            messages=user_prompt,
        )

        exec_time = round(time() - exec_start, 2)

        output_message = response["output"]["message"]
        text_parts = [
            block["text"] for block in output_message["content"] if "text" in block
        ]
        answer = "\n".join(text_parts)
        metric.response = answer

        usage = response.get("usage", {})
        if usage is not None:
            metric.input_tokens = usage.get("inputTokens", 0)
            metric.output_tokens = usage.get("outputTokens", 0)
            metric.total_tokens = usage.get("totalTokens", 0)
            metric.exec_start = exec_start
            metric.exec_time = exec_time

        metric.success = True
        await save_metric(metric)

        return AIChatResponse(
            success=True,
            data=ChatAnswer(answer=answer, sources=None),
        )
    except ClientError as e:
        metric.success = False
        metric.error = e.response["Error"]["Message"]
    except Exception as e:
        metric.success = False
        metric.error = str(e)

    await save_metric(metric)

    return AIChatResponse(success=False, error=metric.error)
