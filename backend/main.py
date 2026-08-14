from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

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
