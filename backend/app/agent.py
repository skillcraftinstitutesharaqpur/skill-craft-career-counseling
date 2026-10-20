import os
import json
import logging
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from typing import Literal

load_dotenv()

logger = logging.getLogger(__name__)

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
    @staticmethod
    def _fallback_roadmap(interest_code: str, education_level: str, response_language: str) -> dict:
        """Return a useful local recommendation when Gemini is unavailable."""
        course_by_interest = {
            "R": "Python Development",
            "I": "Data Science and Analytics",
            "A": "Advanced Graphic Designing & AI",
            "S": "Spoken English/ IELTS Preparation",
            "E": "Digital Marketing & AI",
            "C": "Office Management",
        }
        course = next((course_by_interest[letter] for letter in interest_code if letter in course_by_interest), DIGITAL_COURSES[0])
        academic = {
            "R": "FSc Pre-Engineering",
            "I": "FSc Pre-Engineering",
            "A": "F.A",
            "S": "F.A",
            "E": "I.COM (English Medium)",
            "C": "I.COM (English Medium)",
        }
        academic_track = next((academic[letter] for letter in interest_code if letter in academic), "ICS")

        if response_language == "Roman Urdu":
            summary = f"Aap ke jawab {interest_code} interest pattern ko dikhate hain. Yeh sirf ibtidai rehnumai hai; apni dilchaspi aur salahiyat ko bhi madde nazar rakhein."
            reason = f"{interest_code} pattern ko dekhte hue {academic_track} aur {course} aik munasib ibtidai combination ho sakta hai. Apne marks, dastiyab subjects, aur institute ke admission criteria se is mashwaray ki tasdeeq zaroor karein."
            steps = [
                f"{academic_track} ke subjects aur admission requirements apne college se confirm karein.",
                f"{course} ke course outline aur practical projects Skill Craft Institute se maloom karein.",
                "Rozana chhota study schedule banayein, practice ka record rakhein, aur counselor se apne options discuss karein.",
            ]
        else:
            summary = f"Your answers show a {interest_code} interest pattern. This is an initial guide; consider your own interests and strengths as well."
            reason = f"Based on the {interest_code} pattern, {academic_track} and {course} may be a suitable starting combination. Confirm subject availability, your marks, and admission requirements with your college and institute."
            steps = [
                f"Confirm {academic_track} subjects and admission requirements with your college.",
                f"Ask Skill Craft Institute for the {course} course outline and practical projects.",
                "Set a short daily study schedule, track your practice, and discuss your options with a counselor.",
            ]

        return {
            "interest_code": interest_code,
            "personality_summary": summary,
            "academic_track": academic_track,
            "digital_skill_track": course,
            "why_this_combination": reason,
            "action_plan": steps,
            "is_fallback": True,
        }

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
        try:
            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key:
                raise RuntimeError("GEMINI_API_KEY is not configured")

            client = genai.Client(api_key=api_key)
            response = client.models.generate_content(
                model=os.getenv("GEMINI_MODEL", "gemini-3.8-flash"),
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=CareerRoadmap,
                    temperature=0.3
                ),
            )
            # Clean string return response ko dictionary mein convert karne ke liye
            if not response.text:
                raise ValueError("Gemini returned an empty response")
            roadmap = CareerRoadmap.model_validate(json.loads(response.text))
            if roadmap.interest_code != interest_code:
                raise ValueError("Gemini response interest_code did not match the calculated code")
            return roadmap.model_dump()
        except Exception as exc:
            # Do not log or return the API key, request headers, or raw provider body.
            logger.warning("Gemini roadmap generation failed (%s); using local fallback", type(exc).__name__)
            return self._fallback_roadmap(interest_code, education_level, response_language)

counselor_agent = GeminiCounselor()
