from __future__ import annotations

import os
import re
from typing import Optional, Tuple

from app.core.config import get_settings


CATEGORIES = [
	"1) การเพิ่มขีดความสามารถทางการแข่งขัน โดยเพิ่มรายได้ทางตรง (Direct Revenue) และทางอ้อม (Indirect Revenue)",
	"2) การสร้างการเติบโตสินเชื่อคุณภาพ สินเชื่อยั่งยืนในกลุ่ม Secure Port",
	"3) การบริหารจัดการหนี้ NPLและการบริหารจัดการหนี้ถึงกำหนดชำระ",
	"4) การพัฒนาศักยภาพและเพิ่มขีดความสามารถของลูกค้าพักหนี้",			
	"5) การบริหารจัดการคุณภาพสินเชื่อเพื่อความยั่งยืน",
	"6) ผลิตภัณฑ์หรือบริการที่สอดคล้องกับแนวคิด ESG ",
	"7) การปรับปรุงกระบวนการทำงานเพื่อลดต้นทุนการดำเนินงาน สร้างความยั่งยืนระยะยาว ",
	"8) การสร้างความสัมพันธ์กับลูกค้า เพื่อเพิ่มปริมาณธุรกิจ ",
	"9) การยกระดับกระบวนการทำงาน/การให้บริการด้วยดิจิทัลและข้อมูล ",
	"10) การสร้างมูลค่าเพิ่มทางธุรกิจ เชื่อมโยงตลาดและเพิ่มขีดความสามารถการแข่งขันของเกษตรกรและชุมชน",
]
 

def _keyword_fallback(text: str) -> Optional[str]:
	lower = text.lower()
	if any(k in lower for k in ["loan", "credit", "ผ่อน", "กู้", "สินเชื่อ"]):
		return "สินเชื่อ"
	if any(k in lower for k in ["deposit", "ออม", "ดอกเบี้ย", "ฝาก", "เงินฝาก"]):
		return "เงินฝาก"
	if any(k in lower for k in ["การเมือง", "รัฐบาล", "เลือกตั้ง", "politic"]):
		return "ข่าวการเมือง"
	if any(k in lower for k in ["กีฬา", "บอล", "ฟุตบอล", "sport", "match"]):
		return "ข่าวกีฬา"
	return None


def classify_category(answer_text: str) -> Optional[str]:
	"""Return one of CATEGORIES using OpenAI if configured, otherwise keyword fallback.

	If OpenAI classification fails or is not configured, returns best-effort keyword match
	or None.
	"""
	settings = get_settings()
	api_key = settings.openai_api_key 
	print("api_key:", api_key)
	# Try OpenAI if key is available
	if api_key:
		try:
			print("try OpenAI")
			# Lazy import to avoid dependency if not needed
			from openai import OpenAI
			print("CATEGORIES: ", CATEGORIES)

			os.environ["OPENAI_API_KEY"] = api_key
			client = OpenAI()
			print("client: ", client)
			prompt = (
				"คุณคือนักจัดหมวดหมู่ จัดข้อความคำตอบต่อไปนี้ให้เป็นหนึ่งในหมวดหมู่: "
				+ ", ".join(CATEGORIES)
				+ ".\nตอบกลับเฉพาะชื่อหมวดหมู่เท่านั้น.\nข้อความ: "
				+ answer_text
			)
			print("prompt: ", prompt)

			resp = client.chat.completions.create(
				model="gpt-4.1-mini",
				messages=[{"role": "user", "content": prompt}],
				max_tokens=100,
				temperature=0,
			)
			choice = resp.choices[0].message.content.strip() if resp.choices else ""			
			print(f"OpenAI choice: {choice}")
					
			for cat in CATEGORIES:
				if cat in choice:
					print("Fallback AI rules: ", cat)
					return cat

		except Exception as e:
			print("Exception: ", e)			
			pass

	# Fallback keyword rules
	print("Fallback keyword rules")
	return _keyword_fallback(answer_text) or "อื่นๆ"


def extract_keywords(answer_text: str) -> str:
	"""
	Return up to three short important keywords as a comma-separated string: "k1,k2,k3".
	Uses OpenAI if configured, otherwise falls back to a simple heuristic.
	"""
	settings = get_settings()
	api_key = settings.openai_api_key 
	if api_key:
		try:
			from openai import OpenAI
			os.environ["OPENAI_API_KEY"] = api_key
			client = OpenAI()
			prompt = (
				"สกัดคีย์เวิร์ดที่สำคัญที่สุด 3 คำ จากข้อความต่อไปนี้ โดยตอบกลับรูปแบบ: keyword1,keyword2,keyword3 \n"
				+ answer_text
			)
			resp = client.chat.completions.create(
				model="gpt-4.1-mini",
				messages=[{"role": "user", "content": prompt}],
				max_tokens=60,
				temperature=0,
			)
			content = resp.choices[0].message.content.strip() if resp.choices else ""
			print("Fallback keywords rules: ", content)
			# Normalize spaces
			return ",".join([p.strip() for p in content.split(',') if p.strip()])[:200]
		except Exception:
			pass

	# Fallback: pick up to 3 longest unique words > 3 chars
	words = re.findall(r"[\wก-๙]+", answer_text.lower())
	unique = []
	for w in sorted(set(words), key=lambda x: (-len(x), x)):
		if len(w) > 3:
			unique.append(w)
		if len(unique) >= 3:
			break

	return ",".join(unique)


