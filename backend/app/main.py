import logging
import os
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, conint, field_validator, model_validator
from app.scoring import RIASECEngine
from app.agent import counselor_agent

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Career Architect AI Backend",
    description="Hyper-Localized Psychometric Counseling API for Pakistani Students",
    version="1.0.0"
)

default_frontend_origins = "http://localhost:5173,http://127.0.0.1:5173"
frontend_origins = [
    origin.strip().rstrip("/")
    for origin in os.getenv("FRONTEND_ORIGINS", default_frontend_origins).split(",")
    if origin.strip()
]

# Keep local development working and allow the deployed frontend to be configured safely.
app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    # Vercel assigns deployment-specific URLs in addition to the stable
    # production domain. Allow only this frontend project/team's preview URLs
    # so its browser requests can pass CORS preflight without opening the API
    # to arbitrary origins.
    allow_origin_regex=r"^https://skill-craft-career-counseling-[a-z0-9-]+-skillcraft3\.vercel\.app$",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Incoming API Request Data Schemas
class AssessmentPayload(BaseModel):
    education_level: str = Field(..., min_length=2, max_length=120, description="Student's current baseline education level")
    response_language: Literal["English", "Roman Urdu"] = Field(
        default="English", description="Language for the generated counseling report"
    )
    responses: dict[str, conint(strict=True, ge=0, le=1)] = Field(
        ..., description='Exactly 42 responses, keyed "1" through "42", each 0 or 1'
    )

    @field_validator("education_level")
    @classmethod
    def validate_education_level(cls, value: str) -> str:
        value = value.strip()
        recognized_levels = {
            "Matric Science",
            "Matric Arts",
            "O-Levels / IGCSE",
            "Intermediate",
            "Intermediate Result Awaiting",
            "Intermediate Incomplete",  # Keep compatibility with existing saved clients.
        }
        if value not in recognized_levels and not value.lower().startswith("other:"):
            raise ValueError("Select a listed qualification or provide a qualification after 'Other:'")
        if value.lower().startswith("other:") and len(value.partition(":")[2].strip()) < 2:
            raise ValueError("Please provide your qualification after 'Other:'")
        return value

    @model_validator(mode="after")
    def validate_complete_assessment(self):
        expected = {str(question_id) for question_id in range(1, 43)}
        received = set(self.responses)
        if received != expected:
            missing = sorted(expected - received, key=int)
            extra = sorted(received - expected)
            raise ValueError(f"Responses must include question IDs 1-42; missing={missing}, extra={extra}")
        return self

# Engine initialization
scoring_engine = RIASECEngine()

@app.get("/")
def read_root():
    return {"status": "online", "message": "Career Architect AI Core Engine is running successfully."}

@app.post("/api/counsel/process")
def process_assessment(payload: AssessmentPayload):
    try:
        # Step A: Deterministic calculations using our scoring module
        calculated_scores = scoring_engine.calculate_scores(payload.responses)
        three_letter_code = scoring_engine.get_top_three_code(calculated_scores)
        
        # Step B: LLM Generation for localized tracks using the calculated code
        career_roadmap = counselor_agent.generate_roadmap(
            interest_code=three_letter_code,
            education_level=payload.education_level,
            response_language=payload.response_language,
        )
        
        # Combined unified payload for front-end rendering
        return {
            "success": True,
            "raw_scores": calculated_scores,
            "riasec_code": three_letter_code,
            "roadmap": career_roadmap
        }
        
    except Exception:
        logger.exception("Assessment processing failed")
        raise HTTPException(
            status_code=502,
            detail="Roadmap generation failed. Check the Gemini API key and service availability, then try again.",
        )
