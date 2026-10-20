import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from typing import Literal

load_dotenv()

ACADEMIC_TRACKS = (
    "FSc Pre-Medical",
    "FSc Pre-Engineering",
    "F.A",
    "ICS",
    "I.COM (English Medium)",
    "I.COM (Urdu Medium)",
)

DIGITAL_COURSES = (
    "Office Management",
    "Python Development",
    "Agentic AI & AI Agents",
    "Web Development & AI",
    "Advanced Graphic Designing & AI",
    "Digital Marketing & AI",
    "Data Science and Analytics",
    "Video Editing",
    "AI Prompt Engineering",
    "AI YouTube & TikTok Automation",
    "Spoken English/ IELTS Preparation",
)


class CareerRoadmap(BaseModel):
    interest_code: str
    personality_summary: str = Field(min_length=1)
    academic_track: Literal[
        "FSc Pre-Medical",
        "FSc Pre-Engineering",
        "F.A",
        "ICS",
        "I.COM (English Medium)",
        "I.COM (Urdu Medium)",
    ]
    digital_skill_track: Literal[
        "Office Management",
        "Python Development",
        "Agentic AI & AI Agents",
        "Web Development & AI",
        "Advanced Graphic Designing & AI",
        "Digital Marketing & AI",
        "Data Science and Analytics",
        "Video Editing",
        "AI Prompt Engineering",
        "AI YouTube & TikTok Automation",
        "Spoken English/ IELTS Preparation",
    ]
    why_this_combination: str = Field(min_length=1)
    action_plan: list[str] = Field(min_length=1)

class GeminiCounselor:
    def generate_roadmap(self, interest_code: str, education_level: str, response_language: str = "English") -> dict:
        prompt = f"""
        You are the "Career Architect AI", an expert psychometric counselor specializing in the Pakistani education system (BISE) and global digital economy trends.
        
        The student has taken a 42-question psychometric assessment, and their top structured results are:
        - Calculated RIASEC Interest Code: {interest_code}
        - Student's Current/Baseline Education Level: {education_level}
        
        Your task is to generate a comprehensive, actionable "Hybrid Pathway" roadmap tailored exactly to these parameters.
        
        Strict Implementation Guidelines:
        1. Academic Track: Choose exactly one of: {", ".join(ACADEMIC_TRACKS)}.
        2. Digital Skill Track: Choose exactly one course from this institute's course list and do not suggest, name, or recommend any other digital course: {", ".join(DIGITAL_COURSES)}.
           Match the student's strengths to the closest available course. Return the exact course name as digital_skill_track.
        3. Response language: Write personality_summary, why_this_combination, and every action_plan item in {response_language}.
           If the requested language is Roman Urdu, use simple, natural Urdu written in Latin/Roman letters only; do not use Urdu script.
           If the requested language is English, write clear, supportive English.
           Keep academic_track and digital_skill_track as the exact official English option names listed above.
        
        You MUST respond ONLY with a raw JSON object matching this exact schema:
        {{
        
            "interest_code": "{interest_code}",
            "personality_summary": "A brief, encouraging explanation of what this RIASEC code means in Urdu/English mix.",
            "academic_track": "Recommended traditional Pakistani board option matching their code.",
            "digital_skill_track": "Relevant in-demand digital skill.",
            "why_this_combination": "Explanation of why this combination complements each other perfectly.",
            "action_plan": ["Step 1", "Step 2", "Step 3"]
        }}
        """

        # google-genai native structured JSON configuration
        if not os.getenv("GEMINI_API_KEY"):
            raise RuntimeError("GEMINI_API_KEY is not configured. Add it to backend/.env.")

        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        response = client.models.generate_content(
            model=os.getenv("GEMINI_MODEL", "gemini-3.8-flash"),
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=CareerRoadmap,
                temperature=0.3
            ),
        )
        
        try:
            # Clean string return response ko dictionary mein convert karne ke liye
            if not response.text:
                raise ValueError("Gemini returned an empty response")
            roadmap = CareerRoadmap.model_validate(json.loads(response.text))
            if roadmap.interest_code != interest_code:
                raise ValueError("Gemini response interest_code did not match the calculated code")
            return roadmap.model_dump()
        except Exception as e:
            raise Exception(f"Failed to parse Gemini response: {str(e)} | Raw text: {response.text}")

counselor_agent = GeminiCounselor()
