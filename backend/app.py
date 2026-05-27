from functools import lru_cache
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from transformers import pipeline


app = FastAPI(
    title="AI Model Serving API",
    description="FastAPI backend serving multiple Hugging Face pipelines",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SentimentRequest(BaseModel):
    text: str = Field(..., min_length=3, max_length=1000)


class SummarizeRequest(BaseModel):
    text: str = Field(..., min_length=20, max_length=5000)
    max_length: int = Field(default=130, ge=30, le=300)
    min_length: int = Field(default=30, ge=5, le=150)


class GenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=3, max_length=500)
    max_new_tokens: int = Field(default=80, ge=10, le=250)


class QARequest(BaseModel):
    context: str = Field(..., min_length=20, max_length=6000)
    question: str = Field(..., min_length=3, max_length=500)


@lru_cache
def get_sentiment_model() -> Any:
    return pipeline(
        task="sentiment-analysis",
        model="distilbert-base-uncased-finetuned-sst-2-english",
    )


@lru_cache
def get_summarizer_model() -> Any:
    return pipeline(
        task="summarization",
        model="sshleifer/distilbart-cnn-12-6",
    )


@lru_cache
def get_generator_model() -> Any:
    return pipeline(task="text-generation", model="distilgpt2")


@lru_cache
def get_qa_model() -> Any:
    return pipeline(task="question-answering", model="distilbert-base-cased-distilled-squad")


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "AI Model Serving API is running"}


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/sentiment")
def analyze_sentiment(payload: SentimentRequest) -> dict[str, Any]:
    try:
        model = get_sentiment_model()
        result = model(payload.text)[0]
        return {
            "task": "sentiment-analysis",
            "input": payload.text,
            "result": {
                "label": result.get("label"),
                "score": round(float(result.get("score", 0.0)), 4),
            },
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/api/summarize")
def summarize_text(payload: SummarizeRequest) -> dict[str, Any]:
    if payload.min_length >= payload.max_length:
        raise HTTPException(status_code=400, detail="min_length must be smaller than max_length")

    try:
        model = get_summarizer_model()
        output = model(
            payload.text,
            max_length=payload.max_length,
            min_length=payload.min_length,
            do_sample=False,
        )[0]
        summary = output.get("summary_text", "")
        return {
            "task": "summarization",
            "input_length": len(payload.text),
            "summary_length": len(summary),
            "result": {"summary": summary},
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/api/generate")
def generate_text(payload: GenerateRequest) -> dict[str, Any]:
    try:
        model = get_generator_model()
        output = model(
            payload.prompt,
            max_new_tokens=payload.max_new_tokens,
            num_return_sequences=1,
            do_sample=True,
            temperature=0.9,
            top_k=50,
            top_p=0.95,
            pad_token_id=50256,
        )[0]
        return {
            "task": "text-generation",
            "prompt": payload.prompt,
            "result": {
                "generated_text": output.get("generated_text", "").strip(),
            },
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/api/qa")
def answer_question(payload: QARequest) -> dict[str, Any]:
    try:
        model = get_qa_model()
        output = model(question=payload.question, context=payload.context)
        return {
            "task": "question-answering",
            "question": payload.question,
            "result": {
                "answer": output.get("answer", ""),
                "score": round(float(output.get("score", 0.0)), 4),
                "start": output.get("start"),
                "end": output.get("end"),
            },
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
