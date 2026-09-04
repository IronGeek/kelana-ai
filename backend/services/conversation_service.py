import uuid
from time import time
from os import getenv
from dotenv import load_dotenv
from boto3 import client
from botocore.client import BaseClient
from botocore.exceptions import ClientError
from pydantic import BaseModel
from logging import (
    getLogger,
    basicConfig,
    INFO
)

class SearchConversationPage(BaseModel):
    index:        int | None = 1
    size:         int | None= 10

class SearchConversationRequest(BaseModel):
    title:        str | None = ''
    page:         SearchConversationPage | None = None

class CreateConversationRequest(BaseModel):
    title:        str | None = ''

class UpdateConversationRequest(BaseModel):
    title:        str | None = ''

class CreateMessageRequest(BaseModel):
    id:           uuid.UUID | None = None
    role:         str
    content:      str
    with_kb:      bool | None = None

class ChatMetrics(BaseModel):
    input_tokens:   int
    output_tokens:  int
    total_tokens:   int
    execution_time: float

class ChatSources(BaseModel):
    title: str
    document_id: str
    location: str
    metadata: dict[str,str]
    score: float

class ChatAnswer(BaseModel):
    answer: str
    sources: list[ChatSources] | None = []
    metrics: ChatMetrics | None = None

class ChatResponse(BaseModel):
    success: bool
    error: str | None = None
    data: ChatAnswer | None = None

class ChatMessage(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    created_at: str

class ChatContent(BaseModel):
    text: str

class ChatHistory(BaseModel):
    role: str
    content: list[ChatContent]


logger = getLogger("kb_service")
basicConfig(level=INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Load environment variables from .env
load_dotenv()

AWS_BEARER_TOKEN_BEDROCK = getenv("AWS_BEARER_TOKEN_BEDROCK")
AWS_REGION = getenv("AWS_REGION", "ap-southeast-2")
AWS_BEDROCK_MODEL_ID = getenv("AWS_BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")
AWS_BEDROCK_TEMPERATURE = float(getenv("AWS_BEDROCK_TEMPERATURE", 0.6))
AWS_KNOWLEDGE_BASE_ID = getenv("AWS_KNOWLEDGE_BASE_ID")
AWS_KNOWLEDGE_BASE_MODEL_ARN = getenv("AWS_KNOWLEDGE_BASE_MODEL_ARN")

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

def get_ai_answer(
    id: uuid.UUID,
    history: list[ChatHistory],
    with_kb: bool = False,
    model_id: str = AWS_BEDROCK_MODEL_ID,
    temperature: float = AWS_BEDROCK_TEMPERATURE,
) -> ChatResponse :
    if not AWS_KNOWLEDGE_BASE_ID:
        raise ValueError("AWS_KNOWLEDGE_BASE_ID is missing from the environment or .env file.")

    if not AWS_KNOWLEDGE_BASE_MODEL_ARN:
        raise ValueError("AWS_KNOWLEDGE_BASE_MODEL_ARN is missing from the environment or .env file.")

    start_time = time()
    logger.info(f"Starting Bedrock inference for conversation: '{id}' using model: '{AWS_BEDROCK_MODEL_ID}'")
    try:
        client = get_bedrock_client()
        inference_config = {"temperature": temperature }
        system  = [{
            "text": "You are a helpful assistant. Always format your responses using clean Markdown. Use bolding, bullet points, headers, and code blocks where appropriate."
        }]

        messages = [hist.model_dump() for hist in history]
        response = client.converse(
            modelId=model_id,
            messages=messages,
            inferenceConfig=inference_config,
            system=system,
        )

        # Get execution time
        execution_time = round(time() - start_time, 2)

        # Get token usage statistic from Bedrock metadata object
        usage = response.get("usage", {})

        output_message = response["output"]["message"]
        text_parts = [
            block["text"]
            for block in output_message["content"]
            if "text" in block
        ]
        answer = "\n".join(text_parts)
        metrics = ChatMetrics(
            input_tokens = usage.get("inputTokens", 0),
            output_tokens = usage.get("outputTokens", 0),
            total_tokens = usage.get("totalTokens", 0),
            execution_time = execution_time
        )
        print(f"answer: {answer}")

        # Write metric to applicationn system log
        logger.info(
            f"Bedrock Success | Latency: {execution_time}s | "
            f"Input Tokens: {metrics.input_tokens} | Output Tokens: {metrics.output_tokens} | Total Tokens: {metrics.total_tokens}"
        )

        return ChatResponse(
            success=True,
            data=ChatAnswer(
                answer=answer,
                sources=None,
                metrics=metrics,
            )
        )
    except ClientError as e:
        error_msg = e.response['Error']['Message']
        logger.error(f"Bedrock ClientError: {error_msg}")
        return ChatResponse(success=False, error=f"API Error: {error_msg}")
    except Exception as e:
        logger.error(f"Bedrock Unexpected Error: {str(e)}")
        return ChatResponse(success=False, error=str(e))
