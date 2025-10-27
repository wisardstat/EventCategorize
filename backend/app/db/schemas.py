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
    create_user_name: Optional[str] = None
    create_user_code: Optional[str] = None
    create_user_department: Optional[str] = None


class AnswerOut(BaseModel):
    answer_id: int
    question_id: str
    answer_text: str
    category: str
    create_user_name: Optional[str] = None
    create_user_code: Optional[str] = None
    create_user_department: Optional[str] = None
    answer_keywords: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True





class IdeaCreate(BaseModel):
    idea_code: Optional[str] = Field(None, max_length=10)
    category_idea_type1: Optional[str] = Field(None, max_length=100)
    idea_name: Optional[str] = Field(None, max_length=500)
    idea_subject: Optional[str] = Field(None, max_length=1000)
    idea_source: Optional[str] = Field(None, max_length=1000)
    customer_target: Optional[str] = Field(None, max_length=1000)
    idea_inno_type: Optional[str] = Field(None, max_length=1000)
    idea_detail: Optional[str] = None
    idea_finance_impact: Optional[str] = None
    idea_nonfinance_impact: Optional[str] = None
    idea_status: Optional[str] = Field(None, max_length=100)
    idea_owner_empcode: Optional[str] = Field(None, max_length=100)
    idea_owner_empname: Optional[str] = Field(None, max_length=100)
    idea_owner_deposit: Optional[str] = Field(None, max_length=100)
    idea_owner_contacts: Optional[str] = Field(None, max_length=100)
    idea_keywords: Optional[str] = Field(None, max_length=100)
    idea_comment: Optional[str] = Field(None, max_length=100)
    idea_summary_byai: Optional[str] = None


class IdeaOut(BaseModel):
    idea_seq: int
    idea_code: Optional[str] = None
    category_idea_type1: Optional[str] = None
    idea_name: Optional[str] = None
    idea_subject: Optional[str] = None
    idea_source: Optional[str] = None
    customer_target: Optional[str] = None
    idea_inno_type: Optional[str] = None
    idea_detail: Optional[str] = None
    idea_finance_impact: Optional[str] = None
    idea_nonfinance_impact: Optional[str] = None
    idea_status: Optional[str] = None
    idea_owner_empcode: Optional[str] = None
    idea_owner_empname: Optional[str] = None
    idea_owner_deposit: Optional[str] = None
    idea_owner_contacts: Optional[str] = None
    idea_keywords: Optional[str] = None
    idea_comment: Optional[str] = None
    idea_summary_byai: Optional[str] = None
    idea_score: Optional[int] = None
    idea_score_comment: Optional[str] = None
    create_datetime: datetime
    update_datetime: datetime

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    user_code: str = Field(..., min_length=1, max_length=50)
    user_fname: str = Field(..., min_length=1, max_length=100)
    user_lname: str = Field(..., min_length=1, max_length=100)
    user_login: str = Field(..., min_length=1, max_length=50)
    user_password: str = Field(..., min_length=1)


class UserOut(BaseModel):
    user_code: str
    user_fname: str
    user_lname: str
    user_login: str
    user_createdate: datetime
    user_updatedate: datetime

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    user_login: str = Field(..., min_length=1)
    user_password: str = Field(..., min_length=1)


class UserResponse(BaseModel):
    user_code: str
    user_fname: str
    user_lname: str
    user_login: str
    token: str

    class Config:
        from_attributes = True
