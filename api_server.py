from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from google import genai
from google.genai import types
import base64
import os
import json

app = FastAPI(title="Perfection English School API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class WritingRequest(BaseModel):
    text: Optional[str] = ""
    task_type: str = "General" 
    image_data: Optional[str] = None

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)
else:
    client = None

@app.post("/api/check_writing")
async def check_writing(req: WritingRequest):
    if (not req.text or len(req.text.strip()) < 10) and not req.image_data:
        raise HTTPException(status_code=400, detail="Matn yoki rasm yuborilmadi.")
        
    if not client:
        return {
            "overall_band": "6.5",
            "grammar_feedback": "Asosiy zamonlarni to'g'ri qo'llagansiz, lekin artikllarda xatolar bor.",
            "vocabulary_feedback": "So'z boyligingiz yaxshi. Akademik so'zlarni ishlating.",
            "coherence_feedback": "Fikrlar mantiqan bir-biriga bog'langan.",
            "general_feedback": "DIQQAT: GEMINI_API_KEY topilmadi, shuning uchun bu test javob."
        }
        
    prompt = f"""
    Siz IELTS/CEFR examiner va malakali Ingliz tili o'qituvchisisiz. 
    Quyidagi o'quvchi yozgan inshoni tekshiring.
    Vazifa turi: {req.task_type}
    Matn:
    \"\"\"{req.text}\"\"\"
    
    Quyidagi JSON formatda javob qaytaring (hech qanday boshqa so'zlarsiz, faqat JSON formatda):
    {{
        "overall_band": "Masalan: 6.5",
        "grammar_feedback": "Grammatika bo'yicha xatolar",
        "vocabulary_feedback": "So'z boyligi bo'yicha maslahatlar",
        "coherence_feedback": "Matn mantiqiyligi bo'yicha izoh",
        "general_feedback": "Umumiy xulosa"
    }}
    Barcha izohlaringiz o'zbek tilida yozilsin.
    """
    
    contents = []
    if req.image_data:
        b64_data = req.image_data
        mime_type = "image/jpeg"
        if "," in b64_data:
            mime_part, b64_data = b64_data.split(",", 1)
            try:
                mime_type = mime_part.split(":")[1].split(";")[0]
            except Exception:
                pass
            
        try:
            image_bytes = base64.b64decode(b64_data)
            contents.append(
                types.Part.from_bytes(
                    data=image_bytes,
                    mime_type=mime_type,
                )
            )
        except Exception as e:
            return {
                "overall_band": "XATO",
                "grammar_feedback": "Rasm formatida xatolik.",
                "vocabulary_feedback": "",
                "coherence_feedback": "",
                "general_feedback": str(e)
            }
    
    contents.append(prompt)
    
    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=contents,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        response_text = response.text.strip()
        
        if response_text.startswith("```json"):
            response_text = response_text[7:-3]
        elif response_text.startswith("```"):
            response_text = response_text[3:-3]
            
        result = json.loads(response_text)
        return result
    except Exception as e:
        error_msg = str(e)
        print(f"Gemini API xatoligi: {error_msg}")
        return {
            "overall_band": "XATO",
            "grammar_feedback": "AI xizmati bilan ulanishda xatolik yuz berdi.",
            "vocabulary_feedback": "Sabab:",
            "coherence_feedback": error_msg,
            "general_feedback": f"Xatolik: {error_msg}"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
