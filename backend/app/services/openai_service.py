import openai
from typing import Optional
from app.core.config import get_settings

settings = get_settings()

class OpenAIService:
    def __init__(self):
        self.client = openai.OpenAI(api_key=settings.openai_api_key)
    
    async def summarize_and_format_text(self, text: str) -> str:
        """
        Send text to OpenAI for summarization and formatting
        """
        if not text or text.strip() == "-":
            return "-"
        
        try:
            prompt = f"""
            กรุณาวิเคราะห์และสรุปข้อความต่อไปนี้ให้อ่านง่ายขึ้น โดย:
            1. จัดรูปแบบข้อความให้มีโครงสร้างที่ชัดเจน
            2. สรุปประเด็นสำคัญและใจความหลัก
            3. แบ่งเป็นหัวข้อย่อยๆ ที่เข้าใจง่าย
            4. เน้นความคิดสร้างสรรค์และนวัตกรรมที่สำคัญ
            5. เขียนเป็นภาษาไทยที่กระชับและเข้าใจง่าย
            
            ข้อความต้นฉบับ:
            {text}
            
            กรุณาตอบกลับเป็นภาษาไทยเท่านั้น:
            """
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "คุณเป็นผู้ช่วยในการวิเคราะห์และสรุปข้อความภาษาไทยเพื่อให้อ่านง่ายขึ้น คุณมีความเชี่ยวชาญในการจัดรูปแบบข้อความและสรุปใจความสำคัญ"},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=2000,
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"Error calling OpenAI: {str(e)}")
            return f"เกิดข้อผิดพลาดในการประมวลผล: {str(e)}"

# Create singleton instance
openai_service = OpenAIService()