from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
import json
from groq import Groq

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

# Groq API ni sozlash
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
if GROQ_API_KEY:
    client = Groq(api_key=GROQ_API_KEY)
else:
    client = None

@app.post("/api/check_writing")
async def check_writing(req: WritingRequest):
    if (not req.text or len(req.text.strip()) < 10) and not req.image_data:
        raise HTTPException(status_code=400, detail="Matn yoki rasm yuborilmadi.")
        
    if not client:
        return {
            "overall_band": "XATO",
            "grammar_feedback": "",
            "vocabulary_feedback": "",
            "coherence_feedback": "",
            "general_feedback": "DIQQAT: GROQ_API_KEY topilmadi! Renderda kalitni to'g'ri qo'yganingizni tekshiring."
        }
        
    prompt = f"""
    Siz IELTS/CEFR examiner va malakali Ingliz tili o'qituvchisisiz. 
    Quyidagi o'quvchi yozgan inshoni tekshiring.
    Vazifa turi: {req.task_type}
    Matn:
    \"\"\"{req.text}\"\"\"
    
    Quyidagi JSON formatda javob qaytaring (hech qanday boshqa so'zlarsiz, faqat JSON formatda):
    {{
        "overall_band": "Masalan: 6.5 yoki B2",
        "grammar_feedback": "Grammatika bo'yicha xatolar va tahlil",
        "vocabulary_feedback": "So'z boyligi bo'yicha maslahatlar",
        "coherence_feedback": "Matn mantiqiyligi bo'yicha izoh",
        "general_feedback": "Umumiy xulosa"
    }}
    Barcha izohlaringiz o'zbek tilida yozilsin.
    """
    
    try:
        if req.image_data:
            # Agar rasm yuborilgan bo'lsa, maxsus Vision modelidan foydalanamiz
            model_name = "meta-llama/llama-4-scout-17b-16e-instruct"
            messages = [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": req.image_data
                            }
                        }
                    ]
                }
            ]
        else:
            # Faqat matn bo'lsa, eng aqlli va tezkor Llama 3.3 modelidan foydalanamiz
            model_name = "llama-3.3-70b-versatile"
            messages = [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
            
        chat_completion = client.chat.completions.create(
            messages=messages,
            model=model_name,
            temperature=0.2
        )
        
        response_text = chat_completion.choices[0].message.content.strip()
        
        # Ortiqcha belgilarni tozalab, JSON ga aylantirish
        if response_text.startswith("```json"):
            response_text = response_text[7:-3].strip()
        elif response_text.startswith("```"):
            response_text = response_text[3:-3].strip()
            
        result = json.loads(response_text)
        return result
        
    except Exception as e:
        error_msg = str(e)
        print(f"Groq API xatoligi: {error_msg}")
        return {
            "overall_band": "XATO",
            "grammar_feedback": "AI xizmati bilan ulanishda xatolik yuz berdi.",
            "vocabulary_feedback": "Sabab:",
            "coherence_feedback": error_msg,
            "general_feedback": f"Groq xatosi: {error_msg}"
        }

@app.post("/api/speak")
async def check_speaking(audio: UploadFile = File(...), target_text: str = Form(...)):
    if not client:
        return {"error": "GROQ API kaliti ulanmagan!"}
        
    try:
        file_contents = await audio.read()
        
        # 1. Transcribe the audio using Groq's whisper model
        transcription = client.audio.transcriptions.create(
            file=("audio.webm", file_contents),
            model="whisper-large-v3",
            response_format="json",
        )
        
        transcript = transcription.text
        
        # 2. Score pronunciation by asking LLaMA
        prompt = f"""
        Siz Ingliz tili talaffuzini baholovchi mutaxassissiz.
        O'quvchi quyidagi gapni o'qishi kerak edi:
        "{target_text}"
        
        O'quvchi aytgan gap (AI eshitgan matn):
        "{transcript}"
        
        Iltimos, o'quvchining talaffuziga 0 dan 100% gacha baho bering va qisqacha izoh yozing.
        Agar gap umuman o'xshamasa, past foiz bering.
        Javob faqat ushbu JSON formatda bo'lsin:
        {{
            "score": "Masalan: 85%",
            "transcript": "{transcript}",
            "feedback": "Talaffuz bo'yicha maslahat yoki maqtov (O'zbek tilida)"
        }}
        """
        
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.1
        )
        
        res_text = chat_completion.choices[0].message.content.strip()
        if res_text.startswith("```json"):
            res_text = res_text[7:-3].strip()
        elif res_text.startswith("```"):
            res_text = res_text[3:-3].strip()
            
        result = json.loads(res_text)
        return result
        
    except Exception as e:
        return {"error": f"Gapirishni tekshirishda xatolik: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
