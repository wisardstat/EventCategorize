from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class QuestionCreate(BaseModel):
    question_title: str = Field(..., min_length=1)
    question_description: Optional[str] = None


class QuestionOut(BaseModel):
    question_id: str
    question_title: str
    question_description: Optional[str] = None
    question_categories: Optional[List[str]] = None
    qrcode_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AnswerCreate(BaseModel):
    question_id: str
    answer_text: str = Field(..., min_length=1)
    category: Optional[str] = "General"


class AnswerOut(BaseModel):
    answer_id: int
    question_id: str
    answer_text: str
    category: str
    created_at: datetime

    class Config:
        from_attributes = True


