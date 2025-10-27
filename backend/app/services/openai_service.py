import openai
import json
import logging
from typing import Optional, Dict, Any, List
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
                model="gpt-4.1",
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

    async def score_idea(self, system_prompt: str, idea_name: Optional[str] = None, idea_detail: Optional[str] = None) -> Dict[str, Any]:
        """
        Score an idea using AI based on the provided system prompt
        Returns structured scoring data with scores, explanations, and overall feedback
        """
        if not idea_detail or idea_detail.strip() == "" or idea_detail.strip() == "-":
            raise ValueError("No idea detail to score")
        
        try:
            # Create the prompt for scoring
            idea_context = f"ชื่อความคิดสร้างสรรค์: {idea_name}\n\n" if idea_name else ""
            idea_context += f"รายละเอียดความคิดสร้างสรรค์:\n{idea_detail}"
            
            prompt = f"""
            {system_prompt}

            ความคิดสร้างสรรค์ที่ต้องการประเมิน:
            {idea_context}

            กรุณาประเมินความคิดสร้างสรรค์นี้และตอบกลับในรูปแบบ JSON เท่านั้น โดยมีโครงสร้างดังนี้:

            {{
                "scores": [
                    {{
                        "criterion": "ชื่อเกณฑ์ที่ 1",
                        "score": คะแนน (0-20),
                        "explanation": "คำอธิบายสั้นๆ ว่าทำไมให้คะแนนเท่านี้"
                    }},
                    {{
                        "criterion": "ชื่อเกณฑ์ที่ 2",
                        "score": คะแนน (0-20),
                        "explanation": "คำอธิบายสั้นๆ ว่าทำไมให้คะแนนเท่านี้"
                    }},
                    {{
                        "criterion": "ชื่อเกณฑ์ที่ 3",
                        "score": คะแนน (0-20),
                        "explanation": "คำอธิบายสั้นๆ ว่าทำไมให้คะแนนเท่านี้"
                    }},
                    {{
                        "criterion": "ชื่อเกณฑ์ที่ 4",
                        "score": คะแนน (0-20),
                        "explanation": "คำอธิบายสั้นๆ ว่าทำไมให้คะแนนเท่านี้"
                    }},
                    {{
                        "criterion": "ชื่อเกณฑ์ที่ 5",
                        "score": คะแนน (0-20),
                        "explanation": "คำอธิบายสั้นๆ ว่าทำไมให้คะแนนเท่านี้"
                    }}
                ],
                "overall_score": คะแนนรวม (0-100),
                "overall_feedback": "ข้อเสนอแนะโดยรวมเกี่ยวกับความคิดสร้างสรรค์นี้"
            }}

            ข้อควรระวัง:
            - ตอบกลับเป็น JSON เท่านั้น ไม่ต้องมีข้อความอื่นๆ
            - คะแนนแต่ละเกณฑ์ต้องเป็นตัวเลข 0-20 เท่านั้น
            - คะแนนรวมต้องเป็นผลรวมของคะแนนทั้ง 5 เกณฑ์
            - เขียนคำอธิบายและข้อเสนอแนะเป็นภาษาไทยที่ชัดเจนและมีประโยชน์
            """
            
            # Log the OpenAI API request
            logging.info(f"OpenAI API Request - Model: gpt-4.1, Max tokens: 3000, Temperature: 0.3")            
            logging.info(f"User prompt length: {len(prompt)}")
            logging.info(f"Idea name: {idea_name}")
            logging.info(f"Idea detail length: {len(idea_detail) if idea_detail else 0}")
            
            response = self.client.chat.completions.create(
                model="gpt-4.1",
                messages=[
                    {"role": "system", "content": ''' คุณมีประสบการณ์ทางด้านการพัฒนาเทคโนโลยีหรือนวัตกรรมใหม่ เคยทำงานกับ Elon musk ในโครงการ spaceX มีประสบการณ์การทำงานในธุรกิจธนาคารของประเทศไทยไม่น้อยกว่า 20ปี เคยทำงานที่ศูนย์นวัตกรรมแห่งชาติ 5ปี จบสาขาคอมพิวเตอร์และเทคโนโลยสารสนเทศ จบสาขาการงเงินการบัญชี
/ฉันเป็นกรรมการตัดสินการประกวดนวัตกรรมเพื่อนำไปสร้างผลิตภัณฑ์ใหม่ๆ หรือปรับปรุงกระบวนการทำงานในธนาคาร โดยให้ผู้เข้าแข่งขันส่งบทความเข้ามา และฉันจะให้ Ai ช่วยตัดสินจากบทความนั้นๆ'''},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=3000,
                temperature=0.3
            )
            
            # Log the OpenAI API response
            response_content = response.choices[0].message.content.strip()
            logging.info(f"OpenAI API Response - Status: Success")
            logging.info(f"Response length: {len(response_content)}")
            logging.info(f"Response preview: {response_content[:200]}..." if len(response_content) > 200 else f"Response: {response_content}")
            logging.info(f"Tokens used: {response.usage.total_tokens if hasattr(response, 'usage') else 'N/A'}")
            
            # Parse the JSON response
            response_text = response.choices[0].message.content.strip()
            
            # Remove markdown code block wrapper if present
            if response_text.startswith('```json'):
                response_text = response_text[7:]  # Remove ```json prefix
            if response_text.startswith('```'):
                response_text = response_text[3:]  # Remove ``` prefix
            if response_text.endswith('```'):
                response_text = response_text[:-3]  # Remove ``` suffix
            response_text = response_text.strip()
            
            # Try to parse JSON
            try:
                result = json.loads(response_text)
                
                # Validate the response structure
                if not isinstance(result, dict) or "scores" not in result or "overall_score" not in result:
                    raise ValueError("Invalid response structure")
                
                if not isinstance(result["scores"], list) or len(result["scores"]) != 5:
                    raise ValueError("Expected exactly 5 scores")
                
                # Validate each score
                total_score = 0
                for score_item in result["scores"]:
                    if not isinstance(score_item, dict) or "criterion" not in score_item or "score" not in score_item or "explanation" not in score_item:
                        raise ValueError("Invalid score item structure")
                    
                    score_value = float(score_item["score"])
                    if not (0 <= score_value <= 20):
                        raise ValueError(f"Score {score_value} is out of range (0-20)")
                    
                    total_score += score_value
                
                # Validate overall score
                overall_score = float(result["overall_score"])
                if abs(overall_score - total_score) > 0.1:  # Allow small floating point differences
                    raise ValueError(f"Overall score {overall_score} does not match sum of individual scores {total_score}")
                
                return result
                
            except json.JSONDecodeError as e:
                print(f"Failed to parse JSON response: {response_text}")
                raise ValueError(f"Invalid JSON response from AI: {str(e)}")
            
        except Exception as e:
            print(f"Error calling OpenAI for scoring: {str(e)}")
            raise ValueError(f"Error scoring idea: {str(e)}")

# Create singleton instance
openai_service = OpenAIService()