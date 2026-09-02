from os import (
    getenv,
    path,
)
from dotenv import load_dotenv
from boto3 import client
from botocore.exceptions import ClientError
from pydantic import BaseModel
from urllib.parse import (
    unquote,
    urlparse,
)
from logging import (
    getLogger,
    basicConfig,
    INFO
)

logger = getLogger("kb_service")
basicConfig(level=INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Load environment variables from .env
load_dotenv()

AWS_REGION = getenv("AWS_REGION", "ap-southeast-2")
AWS_BEDROCK_MODEL_ID = getenv("AWS_BEDROCK_MODEL_ID", "amazon.nova-lite-v1:0")
AWS_KNOWLEDGE_BASE_ID = getenv("AWS_KNOWLEDGE_BASE_ID")
AWS_KNOWLEDGE_BASE_MODEL_ARN = getenv("AWS_KNOWLEDGE_BASE_MODEL_ARN")

class AskRequest(BaseModel):
    question: str
    with_kb: bool | None = False

class AskSources(BaseModel):
    title: str
    document_id: str
    location: str
    metadata: dict[str,str]
    score: float

class AskAnswer(BaseModel):
    question: str
    answer: str
    sources: list[AskSources] = []

class AskResponse(BaseModel):
    success: bool
    error: str | None = None
    data: AskAnswer | None = None

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

def retrieve_and_generate(question: str, with_kb: bool = False) -> AskResponse :

    if not AWS_KNOWLEDGE_BASE_ID:
        raise ValueError("AWS_KNOWLEDGE_BASE_ID is missing from the environment or .env file.")

    if not AWS_KNOWLEDGE_BASE_MODEL_ARN:
        raise ValueError("AWS_KNOWLEDGE_BASE_MODEL_ARN is missing from the environment or .env file.")

    sources: list[AskSources] = []
    context: str = "No relevant knowledge base context found."

    if with_kb:
        logger.info(f"Starting KB retrieval for: '{question}' using model: '{AWS_KNOWLEDGE_BASE_ID}'")
        try:
            kb_client = client(service_name="bedrock-agent-runtime", region_name=AWS_REGION)
            knowledge = kb_client.retrieve(
                knowledgeBaseId=AWS_KNOWLEDGE_BASE_ID,
                retrievalQuery={"text": question},
                retrievalConfiguration={
                    "managedSearchConfiguration": {
                        "numberOfResults": 5
                    }
                }
            )

            results = knowledge.get("retrievalResults", [])
            chunks: list[str] = []
            seen_sources = set()

            for result in results:
                content = result.get("content", {})
                text = content.get("text", "").strip()
                if not text:
                    continue

                chunks.append(text)
                location =_get_source_uri(result.get("location", {}))
                title = _get_document_title(result, location)

                if title not in seen_sources:
                    seen_sources.add(title)
                    sources.append(AskSources(
                        title = title,
                        document_id = result.get("documentId"),
                        location = location,
                        metadata = result.get("metadata", {}),
                        score = result.get("score"),
                    ))

            context = "\n\n".join(chunks)
        except ClientError as e:
            error_msg = e.response['Error']['Message']
            logger.error(f"KB ClientError: {error_msg}")
            return AskResponse(success=False, error=f"API Error: {error_msg}")
        except Exception as e:
            logger.error(f"KB Unexpected Error: {str(e)}")
            return AskResponse(success=False, error=str(e))

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
    </question>"""

    logger.info(f"Starting Bedrock inference for: '{prompt}' using model: '{AWS_BEDROCK_MODEL_ID}'")
    try:
        bedrock_client = client(service_name="bedrock-runtime", region_name=AWS_REGION)
        response = bedrock_client.converse(
            modelId=AWS_BEDROCK_MODEL_ID,
            messages=[
                {
                    "role": "user",
                    "content": [{ "text": prompt }],
                }
            ],
        )

        output_message = response["output"]["message"]
        text_parts = [
            block["text"]
            for block in output_message["content"]
            if "text" in block
        ]
        answer = "\n".join(text_parts)

        print(f"answer: {answer}")

        return AskResponse(
            success=True,
            data=AskAnswer(
                question=question,
                answer=answer,
                sources=sources
            )
        )
    except ClientError as e:
        error_msg = e.response['Error']['Message']
        logger.error(f"Bedrock ClientError: {error_msg}")
        return AskResponse(success=False, error=f"API Error: {error_msg}")
    except Exception as e:
        logger.error(f"Bedrock Unexpected Error: {str(e)}")
        return AskResponse(success=False, error=str(e))
