import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db import models
from app.db.schemas import QuestionCreate, QuestionOut, AnswerCreate, AnswerOut
from app.services.classifier import classify_category, extract_keywords
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
    keywords = extract_keywords(payload.answer_text)
    print("Return category: ", category)
    new_answer = models.Answer(
        question_id=payload.question_id,
        answer_text=payload.answer_text,
        category=category,
        create_user_name=payload.create_user_name,
        create_user_department=payload.create_user_department,
        answer_keywords=keywords,
    )
    db.add(new_answer)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create answer")
    db.refresh(new_answer)
    return new_answer


@router.get("/questions/{question_id}/answers", response_model=list[AnswerOut])
def list_answers_for_question(question_id: str, db: Session = Depends(get_db)):
    items = (
        db.query(models.Answer)
        .filter(models.Answer.question_id == question_id)
        .order_by(desc(models.Answer.created_at))
        .all()
    )
    return items


@router.get("/answers", response_model=list[AnswerOut])
def list_all_answers(db: Session = Depends(get_db)):
    items = (
        db.query(models.Answer)
        .order_by(desc(models.Answer.created_at))
        .all()
    )
    return items


@router.delete("/questions/{question_id}")
def delete_question_and_answers(question_id: str, db: Session = Depends(get_db)):
    # Ensure question exists
    question = (
        db.query(models.Question)
        .filter(models.Question.question_id == question_id)
        .first()
    )
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    # Delete related answers first, then the question
    try:
        answers_deleted = (
            db.query(models.Answer)
            .filter(models.Answer.question_id == question_id)
            .delete(synchronize_session=False)
        )
        db.query(models.Question).filter(models.Question.question_id == question_id).delete(
            synchronize_session=False
        )
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete question")

    return {"deleted_question_id": question_id, "answers_deleted": answers_deleted}