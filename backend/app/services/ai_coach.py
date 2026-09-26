import os
from pydantic import BaseModel
from google import genai
from google.genai import types
from app.db.models import GameSession

class CoachFeedback(BaseModel):
    summary: str
    strength: str
    improvement_area: str
    suggested_next_target: str

def generate_session_feedback(session: GameSession) -> CoachFeedback:
    """
    Calls Gemini API to generate personalized feedback based on session metrics.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        # Fallback if no API key is provided
        return CoachFeedback(
            summary="Great workout! (Gemini API Key missing)",
            strength="You completed a session.",
            improvement_area="Add your GEMINI_API_KEY to the backend .env file.",
            suggested_next_target="Play another game."
        )

    client = genai.Client(api_key=api_key)

    prompt = f"""
You are an expert, encouraging AI fitness coach analyzing a user's recent workout session in the GazeFlap app (a gamified push-up tracker).
Here are the metrics from their latest session:

- Total Reps: {session.total_reps}
- Valid Reps (good form): {session.valid_reps}
- Average Form Score: {session.average_form}/100
- Fatigue Indicator: {session.fatigue_indicator}/100
- Game Score: {session.game_score}
- Duration: {session.duration_seconds} seconds

Analyze these metrics and provide constructive, motivating feedback.
Be concise and write exactly 1-2 sentences for each category.
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=CoachFeedback,
            temperature=0.7,
        )
    )

    # The SDK automatically validates structured output against the schema if requested this way
    # We can parse the json directly from response.text
    return CoachFeedback.model_validate_json(response.text)
