from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import httpx
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from openai import OpenAI 
load_dotenv()

router = APIRouter()

class TextRequest(BaseModel):
    text: str

@router.post("/explain")
async def explain_text(request: TextRequest):
    print("came here")
    """
    Proxy endpoint that forwards the text to an AI API and streams back the response
    """
    api_key = os.getenv("API_KEY")
    api_endpoint = os.getenv("API_ENDPOINT")
    api_model = os.getenv("API_MODEL")
    
    if not api_key or not api_endpoint:
        raise HTTPException(status_code=422, detail="API configuration missing")
    
    try:
        return await stream_explanation(request.text, api_key, api_endpoint, api_model)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Error processing request: {str(e)}")

async def stream_explanation(text: str, api_key: str, api_endpoint: str, api_model: str):
    """
    Stream the explanation from the AI API to the client
    """

    client = OpenAI(base_url=api_endpoint, api_key=api_key)

    response = client.chat.completions.create(
    messages=[
        {"role": "system", "content": "You are a helpful assistant that explains text concisely."},
        {"role": "user", "content": f"Explain this text: {text}"}
    ],
    temperature=1.0,
    top_p=1.0,
    max_tokens=1000,
    model=api_model
    )
    return response.choices[0].message.content
