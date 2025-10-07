from __future__ import annotations

import os
import re
from typing import Optional

from app.core.config import get_settings


CATEGORIES = [
	"สินเชื่อ",
	"เงินฝาก",
	"ข่าวการเมือง",
	"ข่าวกีฬา",
	"อื่นๆ",
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
	api_key = settings.openai_api_key.strip()
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
				model="gpt-4o-mini",
				messages=[{"role": "user", "content": prompt}],
				max_tokens=10,
				temperature=0,
			)
			choice = resp.choices[0].message.content.strip() if resp.choices else ""			
			print(f"OpenAI choice: {choice}")
					
			for cat in CATEGORIES:
				if cat in choice:
					return cat
		except Exception as e:
			print("Exception: ", e)			
			pass

	# Fallback keyword rules
	return _keyword_fallback(answer_text) or "อื่นๆ"


