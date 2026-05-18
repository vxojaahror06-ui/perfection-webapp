from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import google.generativeai as genai
import base64
import os
import json

app = FastAPI(title="Perfection English School API")

# GitHub Pages dagi ilovamiz bu serverga ulana olishi uchun CORS ruxsatnomasi
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Barcha saytlardan so'rovlarni qabul qilish (Xavfsizlik uchun keyin cheklash mumkin)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class WritingRequest(BaseModel):
    text: Optional[str] = ""
    task_type: str = "General" 
    image_data: Optional[str] = None

# Gemini API ni sozlash (GEMINI_API_KEY muhit o'zgaruvchisidan olinadi)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    model = None
    print("OGOHLANTIRISH: GEMINI_API_KEY topilmadi. Mock ma'lumotlar qaytariladi.")

@app.post("/api/check_writing")
async def check_writing(req: WritingRequest):
    if (not req.text or len(req.text.strip()) < 10) and not req.image_data:
        raise HTTPException(status_code=400, detail="Matn yoki rasm yuborilmadi.")
        
    if not model:
        # Agar API kalit bo'lmasa, sinov uchun soxta (mock) javob qaytarish
        return {
            "overall_band": "6.5",
            "grammar_feedback": "Asosiy zamonlarni to'g'ri qo'llagansiz, lekin artikllarda (a/an/the) xatolar bor.",
            "vocabulary_feedback": "So'z boyligingiz yaxshi. 'Good' yoki 'Bad' o'rniga akademik so'zlarni ishlating.",
            "coherence_feedback": "Fikrlar mantiqan bir-biriga bog'langan. Paragraflarga ajratishni unutmang.",
            "general_feedback": "Yaxshi harakat! Bu hozircha test rejimidagi javob, rasm funksiyasi ishlashi uchun API kalit kerak."
        }
        
    prompt = f"""
    Siz IELTS/CEFR examiner va malakali Ingliz tili o'qituvchisisiz. 
    Quyidagi o'quvchi yozgan inshoni tekshiring. Agar foydalanuvchi rasm yuborgan bo'lsa, rasmdagi qo'lyozmani o'qing va uni ham tahlil qiling.
    Vazifa turi: {req.task_type}
    Matn:
    \"\"\"{req.text}\"\"\"
    
    Quyidagi JSON formatda javob qaytaring (hech qanday boshqa so'zlarsiz, faqat JSON formatda):
    {{
        "overall_band": "Masalan: 6.5 yoki B2",
        "grammar_feedback": "Grammatika bo'yicha xatolar va ularni tuzatish",
        "vocabulary_feedback": "So'z boyligi bo'yicha maslahatlar",
        "coherence_feedback": "Matn mantiqiyligi bo'yicha izoh",
        "general_feedback": "Umumiy xulosa va ruhlantiruvchi fikrlar"
    }}
    Barcha izohlaringiz o'zbek tilida yozilsin va do'stona ohangda bo'lsin.
    """
    
    contents = []
    if req.image_data:
        # Remove data URI prefix if it exists
        b64_data = req.image_data
        mime_type = "image/jpeg"
        if "," in b64_data:
            mime_part, b64_data = b64_data.split(",", 1)
            # Optional: parse exact mime type from mime_part
            try:
                mime_type = mime_part.split(":")[1].split(";")[0]
            except Exception:
                pass
            
        try:
            image_bytes = base64.b64decode(b64_data)
            contents.append({
                "mime_type": mime_type,
                "data": image_bytes
            })
        except Exception as e:
            raise HTTPException(status_code=400, detail="Rasm formatida xatolik.")
    
    contents.append(prompt)
    
    try:
        response = model.generate_content(contents)
        response_text = response.text.strip()
        
        # JSON o'qish uchun ortiqcha belgilarni tozalash
        if response_text.startswith("```json"):
            response_text = response_text[7:-3]
        elif response_text.startswith("```"):
            response_text = response_text[3:-3]
            
        result = json.loads(response_text)
        return result
    except Exception as e:
        print(f"Gemini API xatoligi: {e}")
        raise HTTPException(status_code=500, detail="AI xizmati bilan ulanishda xatolik yuz berdi. Iltimos keyinroq qayta urining.")

if __name__ == "__main__":
    import uvicorn
    # Test qilish uchun: python api_server.py
    uvicorn.run(app, host="0.0.0.0", port=8000)
