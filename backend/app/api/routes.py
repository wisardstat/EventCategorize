import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db import models
from app.db.schemas import QuestionCreate, QuestionOut, AnswerCreate, AnswerOut
from app.services.classifier import classify_category
from sqlalchemy import desc

router = APIRouter()


@router.get("/health")
def health_check():
    return {"status": "ok"}


@router.post("/questions", response_model=QuestionOut, status_code=status.HTTP_201_CREATED)
def create_question(payload: QuestionCreate, db: Session = Depends(get_db)):
    new_question = models.Question(
        question_id=str(uuid.uuid4()),
        question_title=payload.question_title,
        question_description=payload.question_description,
        question_categories=None,
        qrcode_url=None,
    )
    db.add(new_question)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create question")
    db.refresh(new_question)
    return new_question


@router.get("/questions", response_model=list[QuestionOut])
def list_questions(db: Session = Depends(get_db)):
    items = (
        db.query(models.Question)
        .order_by(desc(models.Question.created_at))
        .all()
    )
    return items


@router.get("/questions/{question_id}", response_model=QuestionOut)
def get_question(question_id: str, db: Session = Depends(get_db)):
    item = db.query(models.Question).filter(models.Question.question_id == question_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Question not found")
    return item


@router.post("/answers", response_model=AnswerOut, status_code=status.HTTP_201_CREATED)
def create_answer(payload: AnswerCreate, db: Session = Depends(get_db)):
    print("payload: ", payload)    
    category = classify_category(payload.answer_text)
    print("Return category: ", category)
    new_answer = models.Answer(
        question_id=payload.question_id,
        answer_text=payload.answer_text,
        category=category,
    )
    db.add(new_answer)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create answer")
    db.refresh(new_answer)
    return new_answer
