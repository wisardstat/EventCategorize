import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy.sql import func as sql_func

from app.db.database import get_db
from app.db import models
from app.db.schemas import QuestionCreate, QuestionOut, AnswerCreate, AnswerOut, IdeaCreate, IdeaOut, UserCreate, UserOut, UserLogin, UserResponse
from pydantic import BaseModel
from pydantic import BaseModel
from app.services.classifier import classify_category, extract_keywords
from app.services.openai_service import openai_service
from app.services.auth_service import verify_password, get_password_hash, create_access_token, verify_token, validate_password_hash
from sqlalchemy import desc
from datetime import timedelta
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Security

security = HTTPBearer()

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
        create_user_code=payload.create_user_code,
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


# Idea Tank API Routes
@router.post("/ideas", response_model=IdeaOut, status_code=status.HTTP_201_CREATED)
def create_idea(payload: IdeaCreate, db: Session = Depends(get_db)):
    new_idea = models.IdeaTank(
        idea_code=payload.idea_code,
        category_idea_type1=payload.category_idea_type1,
        idea_name=payload.idea_name,
        idea_subject=payload.idea_subject,
        idea_source=payload.idea_source,
        customer_target=payload.customer_target,
        idea_inno_type=payload.idea_inno_type,
        idea_detail=payload.idea_detail,
        idea_finance_impact=payload.idea_finance_impact,
        idea_nonfinance_impact=payload.idea_nonfinance_impact,
        idea_status=payload.idea_status,
        idea_owner_empcode=payload.idea_owner_empcode,
        idea_owner_empname=payload.idea_owner_empname,
        idea_owner_deposit=payload.idea_owner_deposit,
        idea_owner_contacts=payload.idea_owner_contacts,
        idea_keywords=payload.idea_keywords,
        idea_comment=payload.idea_comment,
        idea_summary_byai=payload.idea_summary_byai,
    )
    db.add(new_idea)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create idea")
    db.refresh(new_idea)
    return new_idea


@router.get("/ideas", response_model=list[IdeaOut])
def list_all_ideas(
    keyword: Optional[str] = None,
    min_score: Optional[int] = None,
    max_score: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.IdeaTank)
    
    # Add keyword search filter if provided
    if keyword:
        keyword_lower = keyword.lower()
        query = query.filter(
            (models.IdeaTank.idea_keywords.ilike(f"%{keyword_lower}%")) |
            (models.IdeaTank.idea_name.ilike(f"%{keyword_lower}%")) |
            (models.IdeaTank.idea_detail.ilike(f"%{keyword_lower}%")) |
            (models.IdeaTank.idea_code.ilike(f"%{keyword_lower}%"))
        )
    
    # Add score range filter if provided
    if min_score is not None:
        query = query.filter(models.IdeaTank.idea_score >= min_score)
    
    if max_score is not None:
        query = query.filter(models.IdeaTank.idea_score <= max_score)
    
    items = (
        query
        .order_by(models.IdeaTank.idea_seq)
        .all()
    )
    return items


@router.get("/ideas/random", response_model=IdeaOut)
def get_random_idea(db: Session = Depends(get_db)):
    """
    Get a random idea from the idea tank
    """
    # Get a random idea using SQLAlchemy's random function
    idea = db.query(models.IdeaTank).filter(
        models.IdeaTank.idea_detail.isnot(None),
        models.IdeaTank.idea_detail != "",
        models.IdeaTank.idea_detail != "-"
    ).order_by(sql_func.random()).first()
    
    if not idea:
        raise HTTPException(status_code=404, detail="No ideas found")
    
    return idea


class ScoreIdeaRequest(BaseModel):
    system_prompt: str
    idea_name: Optional[str] = None
    idea_detail: Optional[str] = None


class ScoreResponse(BaseModel):
    scores: list[dict]
    overall_score: float
    overall_feedback: str


class BatchScoreRequest(BaseModel):
    system_prompt: str
    limit: Optional[int] = None
    clear_scores: Optional[bool] = False


class BatchScoreResponse(BaseModel):
    processed_count: int
    success_count: int
    error_count: int
    errors: list[str]


@router.post("/ideas/score", response_model=ScoreResponse)
async def score_idea(request: ScoreIdeaRequest):
    """
    Score an idea using AI based on the provided system prompt
    """
    print('Score idea request received')
    try:
        # Call OpenAI service to score the idea
        result = await openai_service.score_idea(
            system_prompt=request.system_prompt,
            idea_detail=request.idea_detail
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error scoring idea: {str(e)}"
        )


@router.post("/ideas/batch-score", response_model=BatchScoreResponse)
async def batch_score_ideas(request: BatchScoreRequest, db: Session = Depends(get_db)):
    """
    Batch score ideas using AI based on the provided system prompt
    - Get ideas from idea_tank table based on limit
    - Score each idea using AI
    - Update idea_score and idea_score_comment fields
    - Return summary of results
    """
    try:
        # Clear scores if requested
        if request.clear_scores:
            clear_result = await clear_idea_scores(db)
            if not clear_result.get("success"):
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to clear scores: {clear_result.get('error', 'Unknown error')}"
                )
        
        # Build query to get ideas that need scoring
        query = db.query(models.IdeaTank).filter(
            models.IdeaTank.idea_detail.isnot(None),
            models.IdeaTank.idea_detail != "",
            models.IdeaTank.idea_detail != "-"
        )
        
        # If limit is specified (not "all"), only select ideas that don't have scores yet
        if request.limit:
            query = query.filter(
                models.IdeaTank.idea_score.is_(None)
            )
            # Apply limit after filtering for ideas without scores
            query = query.limit(request.limit)
        
        ideas = query.all()
        
        if not ideas:
            return {
                "processed_count": 0,
                "success_count": 0,
                "error_count": 0,
                "errors": ["ไม่มีรายการที่ต้องการสร้าง score"]
            }
        
        processed_count = 0
        success_count = 0
        error_count = 0
        errors = []
        
        for idea in ideas:
            try:
                # Skip ideas with empty detail
                if not idea.idea_detail or idea.idea_detail.strip() == "" or idea.idea_detail.strip() == "-":
                    errors.append(f"ไอเดีย {idea.idea_seq}: ไม่มีรายละเอียดให้ประเมิน")
                    error_count += 1
                    continue
                
                # Score the idea using AI
                result = await openai_service.score_idea(
                    system_prompt=request.system_prompt,
                    idea_name=idea.idea_name,
                    idea_detail=idea.idea_detail
                )
                
                # Extract the numeric score from overall_score (e.g., 80 from 80/100 format)
                overall_score = result.get("overall_score", 0)
                if isinstance(overall_score, str) and "/" in overall_score:
                    # Handle format like "80/100"
                    score_parts = overall_score.split("/")
                    numeric_score = int(float(score_parts[0]))
                else:
                    # Handle direct numeric score
                    numeric_score = int(float(overall_score))
                
                # Format the full response for idea_score_comment
                formatted_result = "=== ผลการประเมินความคิดสร้างสรรค์ ===\n\n"
                
                for score_item in result.get("scores", []):
                    formatted_result += f"{score_item.get('criterion', '')}\n"
                    formatted_result += f"คะแนน: {score_item.get('score', 0)}/20\n"
                    formatted_result += f"คำอธิบาย: {score_item.get('explanation', '')}\n\n"
                
                formatted_result += f"คะแนนรวม: {overall_score}\n"
                formatted_result += f"เฉลี่ย: {numeric_score / 5:.1f}/20\n\n"
                formatted_result += f"ข้อเสนอแนะโดยรวม:\n{result.get('overall_feedback', '')}"
                
                # Update the idea with score and comment
                idea.idea_score = numeric_score
                idea.idea_score_comment = formatted_result
                idea.update_datetime = datetime.now()
                
                processed_count += 1
                success_count += 1
                
            except Exception as e:
                error_msg = f"Error processing idea {idea.idea_seq}: {str(e)}"
                errors.append(error_msg)
                error_count += 1
                print(error_msg)
                continue
        
        # Commit all changes
        try:
            db.commit()
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )
        
        return {
            "processed_count": processed_count,
            "success_count": success_count,
            "error_count": error_count,
            "errors": errors
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error in batch scoring: {str(e)}"
        )


@router.post("/ideas/clear-scores")
async def clear_idea_scores(db: Session = Depends(get_db)):
    """
    Clear all idea scores by setting idea_score to null
    """
    try:
        # Update all ideas to set idea_score to null
        update_result = db.query(models.IdeaTank).update(
            {"idea_score": None, "idea_score_comment": None, "update_datetime": datetime.now()}
        )
        
        db.commit()
        
        return {
            "success": True,
            "cleared_count": update_result,
            "message": f"ล้างคะแนนทั้งหมดเรียบร้อยแล้ว ({update_result} รายการ)"
        }
        
    except Exception as e:
        db.rollback()
        return {
            "success": False,
            "error": str(e),
            "message": f"เกิดข้อผิดพลาด: {str(e)}"
        }


@router.get("/ideas/{idea_seq}", response_model=IdeaOut)
def get_idea(idea_seq: int, db: Session = Depends(get_db)):
    item = db.query(models.IdeaTank).filter(models.IdeaTank.idea_seq == idea_seq).first()
    if not item:
        raise HTTPException(status_code=404, detail="Idea not found")
    return item


@router.get("/ideas/code/{idea_code}", response_model=IdeaOut)
def get_idea_by_code(idea_code: str, db: Session = Depends(get_db)):
    """
    Get an idea by its idea_code
    """
    item = db.query(models.IdeaTank).filter(models.IdeaTank.idea_code == idea_code).first()
    if not item:
        raise HTTPException(status_code=404, detail="Idea not found")
    return item


@router.put("/ideas/{idea_seq}", response_model=IdeaOut)
def update_idea(idea_seq: int, payload: IdeaCreate, db: Session = Depends(get_db)):
    idea = db.query(models.IdeaTank).filter(models.IdeaTank.idea_seq == idea_seq).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    
    # Update all fields
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(idea, field, value)
    
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update idea")
    db.refresh(idea)
    return idea


class IdeaUpdate(BaseModel):
    idea_keywords: Optional[str] = None
    # Add other fields that can be partially updated

@router.patch("/ideas/{idea_seq}", response_model=IdeaOut)
def partial_update_idea(idea_seq: int, payload: IdeaUpdate, db: Session = Depends(get_db)):
    idea = db.query(models.IdeaTank).filter(models.IdeaTank.idea_seq == idea_seq).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    
    # Update only provided fields
    update_data = payload.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(idea, field, value)
    
    idea.update_datetime = datetime.now()
    
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update idea")
    db.refresh(idea)
    return idea

@router.delete("/ideas/{idea_seq}")
def delete_idea(idea_seq: int, db: Session = Depends(get_db)):
    idea = db.query(models.IdeaTank).filter(models.IdeaTank.idea_seq == idea_seq).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    
    try:
        db.delete(idea)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete idea")
    
    return {"deleted_idea_seq": idea_seq}


@router.post("/ideas/bulk-import", status_code=status.HTTP_201_CREATED)
async def bulk_import_ideas(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Bulk import ideas from Excel file
    Expected columns: idea_code, category_idea_type1, idea_name, idea_subject, idea_source,
    customer_target, idea_inno_type, idea_detail, idea_finance_impact, idea_nonfinance_impact,
    idea_status, idea_owner_empcode, idea_owner_empname, idea_owner_deposit, idea_owner_contacts,
    idea_keywords, idea_comment, idea_summary_byai
    """
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only Excel files (.xlsx, .xls) are supported"
        )
    
    try:
        # Import pandas only when needed
        import pandas as pd
        
        # Read Excel file
        contents = await file.read()
        df = pd.read_excel(contents)
        
        # Validate required columns
        required_columns = [
            "idea_code", "category_idea_type1", "idea_name", "idea_subject", "idea_source",
            "customer_target", "idea_inno_type", "idea_detail", "idea_finance_impact",
            "idea_nonfinance_impact", "idea_status", "idea_owner_empcode", "idea_owner_empname",
            "idea_owner_deposit", "idea_owner_contacts", "idea_keywords", "idea_comment",
            "idea_summary_byai"
        ]
        
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing required columns: {', '.join(missing_columns)}"
            )
        
        # Get current timestamp for create_datetime and update_datetime
        current_time = datetime.now()
        
        # Process each row
        imported_count = 0
        errors = []
        print('Process each row')
        for index, row in df.iterrows():
            try:
                # Create new idea
                new_idea = models.IdeaTank(
                    idea_code=str(row.get("idea_code", "")) if pd.notna(row.get("idea_code")) else None,
                    category_idea_type1=str(row.get("category_idea_type1", "")) if pd.notna(row.get("category_idea_type1")) else None,
                    idea_name=str(row.get("idea_name", "")) if pd.notna(row.get("idea_name")) else None,
                    idea_subject=str(row.get("idea_subject", "")) if pd.notna(row.get("idea_subject")) else None,
                    idea_source=str(row.get("idea_source", "")) if pd.notna(row.get("idea_source")) else None,
                    customer_target=str(row.get("customer_target", "")) if pd.notna(row.get("customer_target")) else None,
                    idea_inno_type=str(row.get("idea_inno_type", "")) if pd.notna(row.get("idea_inno_type")) else None,
                    idea_detail=str(row.get("idea_detail", "")) if pd.notna(row.get("idea_detail")) else None,
                    idea_finance_impact=str(row.get("idea_finance_impact", "")) if pd.notna(row.get("idea_finance_impact")) else None,
                    idea_nonfinance_impact=str(row.get("idea_nonfinance_impact", "")) if pd.notna(row.get("idea_nonfinance_impact")) else None,
                    idea_status=str(row.get("idea_status", "")) if pd.notna(row.get("idea_status")) else None,
                    idea_owner_empcode=str(row.get("idea_owner_empcode", "")) if pd.notna(row.get("idea_owner_empcode")) else None,
                    idea_owner_empname=str(row.get("idea_owner_empname", "")) if pd.notna(row.get("idea_owner_empname")) else None,
                    idea_owner_deposit=str(row.get("idea_owner_deposit", "")) if pd.notna(row.get("idea_owner_deposit")) else None,
                    idea_owner_contacts=str(row.get("idea_owner_contacts", "")) if pd.notna(row.get("idea_owner_contacts")) else None,
                    idea_keywords=str(row.get("idea_keywords", "")) if pd.notna(row.get("idea_keywords")) else None,
                    idea_comment=str(row.get("idea_comment", "")) if pd.notna(row.get("idea_comment")) else None,
                    idea_summary_byai=str(row.get("idea_summary_byai", "")) if pd.notna(row.get("idea_summary_byai")) else None,
                    create_datetime=current_time,
                    update_datetime=current_time
                )
                
                db.add(new_idea)
                imported_count += 1
                print('Create new idea row_no: ', index + 2)  # +2 because Excel rows are 1-indexed and header is row 1
                
            except Exception as e:
                errors.append(f"Row {index + 2}: {str(e)}")  # +2 because Excel rows are 1-indexed and header is row 1
        
        # Commit all changes
        try:
            print('Commit all changes')
            db.commit()
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )
        
        return {
            "message": f"Successfully imported {imported_count} ideas",
            "total_rows": len(df),
            "imported_count": imported_count,
            "errors": errors
        }
        
    except pd.errors.EmptyDataError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Excel file is empty"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing file: {str(e)}"
        )


@router.post("/ideas/{idea_seq}/summarize", response_model=IdeaOut)
async def summarize_idea(idea_seq: int, db: Session = Depends(get_db)):
    """
    Use AI to summarize and format the idea detail, then update the idea_summary_byai field
    """
    # Get the idea
    idea = db.query(models.IdeaTank).filter(models.IdeaTank.idea_seq == idea_seq).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    
    # Check if idea_detail exists
    if not idea.idea_detail or idea.idea_detail.strip() == "" or idea.idea_detail.strip() == "-":
        raise HTTPException(status_code=400, detail="No idea detail to summarize")
    
    try:
        # Call OpenAI service to summarize and format the text
        summarized_text = await openai_service.summarize_and_format_text(idea.idea_detail)
        
        # Update the idea_summary_byai field
        idea.idea_summary_byai = summarized_text
        idea.update_datetime = datetime.now()
        
        # Save to database
        db.commit()
        db.refresh(idea)
        
        return idea
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error summarizing idea: {str(e)}"
        )

class ExtractKeywordsRequest(BaseModel):
    text: str

@router.post("/extract-keywords")
def extract_keywords_endpoint(request: ExtractKeywordsRequest):
    """
    Extract keywords from text using AI
    Returns comma-separated keywords: "keyword1,keyword2,keyword3"
    """
    try:
        keywords = extract_keywords(request.text)
        return {"keywords": keywords}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error extracting keywords: {str(e)}"
        )


@router.post("/ideas/generate-keywords")
async def generate_keywords_for_ideas(db: Session = Depends(get_db)):
    """
    Generate keywords for ideas that don't have them
    - Find ideas with empty or null idea_keywords
    - Extract keywords from idea_detail using OpenAI
    - Update the database with new keywords
    - Return summary of results
    """
    try:
        # Find ideas without keywords
        target_ideas = db.query(models.IdeaTank).filter(
            (models.IdeaTank.idea_keywords.is_(None)) |
            (models.IdeaTank.idea_keywords == "") |
            (models.IdeaTank.idea_keywords == "-")
        ).limit(30).all()
        
        if not target_ideas:
            return {"message": "ไม่มีรายการที่ต้องการสร้างคีย์เวิร์ด", "processed_count": 0}
        
        processed_count = 0
        skipped_count = 0
        errors = []
        
        for idea in target_ideas:
            try:
                # Skip ideas with empty detail
                if not idea.idea_detail or idea.idea_detail.strip() == "" or idea.idea_detail.strip() == "-":
                    skipped_count += 1
                    continue
                
                # Extract keywords using OpenAI
                keywords = extract_keywords(idea.idea_detail)
                
                # Update the idea with new keywords
                idea.idea_keywords = keywords
                idea.update_datetime = datetime.now()
                
                processed_count += 1
                
            except Exception as e:
                error_msg = f"Error processing idea {idea.idea_seq}: {str(e)}"
                errors.append(error_msg)
                print(error_msg)
                continue
        
        # Commit all changes
        try:
            db.commit()
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )
        
        return {
            "message": "เรียบร้อยแล้ว",
            "processed_count": processed_count,
            "skipped_count": skipped_count,
            "errors": errors
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating keywords: {str(e)}"
        )


# Authentication dependency
def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_login: str = payload.get("sub")
    if user_login is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(models.User).filter(models.User.user_login == user_login).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


# User Authentication Routes
@router.post("/auth/login", response_model=UserResponse)
def login_user(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.user_login == user_credentials.user_login).first()

    print('user_login :',models.User.user_login)
    print('user_password :',user.user_password)

    if not user or not verify_password(user_credentials.user_password, user.user_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.user_login}, expires_delta=access_token_expires
    )
    
    return {
        "user_code": user.user_code,
        "user_fname": user.user_fname,
        "user_lname": user.user_lname,
        "user_login": user.user_login,
        "token": access_token
    }


def generate_user_code(db: Session) -> str:
    """
    Generate a unique user_code in format USERXXXX where XXXX is a sequential number
    """
    # Get the maximum numeric part from existing user codes
    max_code_query = db.query(models.User.user_code).filter(
        models.User.user_code.like("USER%")
    ).all()
    
    max_number = 0
    for (code,) in max_code_query:
        try:
            # Extract numeric part from USERXXXX format
            if code.startswith("USER"):
                number_part = code[4:]  # Remove "USER" prefix
                if number_part.isdigit():
                    number = int(number_part)
                    if number > max_number:
                        max_number = number
        except (ValueError, IndexError):
            continue
    
    # Generate new code with next sequential number
    new_number = max_number + 1
    return f"USER{new_number:04d}"  # Format as USER0001, USER0002, etc.


@router.get("/users/generate-code")
def generate_user_code_endpoint(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """
    Generate a unique user code
    Returns the next available user code in format USERXXXX
    """
    user_code = generate_user_code(db)
    return {"user_code": user_code}


@router.post("/auth/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user_login already exists
    print('# Check if user_login already exists')
    existing_user = db.query(models.User).filter(models.User.user_login == user_data.user_login).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Auto-generate user_code if not provided or empty
    print('# Auto-generate user_code if not provided or empty')
    user_code = user_data.user_code.strip() if user_data.user_code else ""
    if not user_code:
        user_code = generate_user_code(db)
    else:
        # Check if provided user_code already exists
        existing_code = db.query(models.User).filter(models.User.user_code == user_code).first()
        if existing_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User code already exists"
            )
    
    # Validate the password
    print('# Validate the password')
    if not validate_password_hash(user_data.user_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password cannot be empty"
        )
    
    # Create new user with plain text password
    print('# Create new user with plain text password')
    new_user = models.User(
        user_code=user_code,
        user_fname=user_data.user_fname,
        user_lname=user_data.user_lname,
        user_login=user_data.user_login,
        user_password=user_data.user_password  # Store plain text password
    )
    
    db.add(new_user)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create user")
    
    db.refresh(new_user)
    return new_user


# User Management Routes
@router.get("/users", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    users = db.query(models.User).order_by(desc(models.User.user_createdate)).all()
    return users


@router.get("/users/{user_code}", response_model=UserOut)
def get_user(user_code: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    user = db.query(models.User).filter(models.User.user_code == user_code).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/users/{user_code}", response_model=UserOut)
def update_user(user_code: str, user_data: UserCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    user = db.query(models.User).filter(models.User.user_code == user_code).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if new user_login already exists (excluding current user)
    if user_data.user_login != user.user_login:
        existing_user = db.query(models.User).filter(
            models.User.user_login == user_data.user_login,
            models.User.user_code != user_code
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
    
    # Update user fields
    user.user_fname = user_data.user_fname
    user.user_lname = user_data.user_lname
    user.user_login = user_data.user_login
    
    # Only update password if provided
    if user_data.user_password:
        # Validate the password
        if not validate_password_hash(user_data.user_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password cannot be empty"
            )
        
        user.user_password = user_data.user_password  # Store plain text password
    
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update user")
    
    db.refresh(user)
    return user


@router.delete("/users/{user_code}")
def delete_user(user_code: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    user = db.query(models.User).filter(models.User.user_code == user_code).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent self-deletion
    if user.user_code == current_user.user_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    try:
        db.delete(user)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete user")
    
    return {"deleted_user_code": user_code}


@router.post("/users/create-admin")
def create_admin_user(db: Session = Depends(get_db)):
    """Create a default admin user if it doesn't exist"""
    admin_login = "admin"
    admin_code = "ADMIN001"
    
    # Check if admin already exists
    existing_admin = db.query(models.User).filter(models.User.user_login == admin_login).first()
    if existing_admin:
        return {"message": "Admin user already exists"}
    
    # Create admin user with plain text password
    admin_password = "admin123"  # Default password, should be changed
    
    # Validate the password
    if not validate_password_hash(admin_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password cannot be empty"
        )
    
    admin_user = models.User(
        user_code=admin_code,
        user_fname="System",
        user_lname="Administrator",
        user_login=admin_login,
        user_password=admin_password  # Store plain text password
    )
    
    db.add(admin_user)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create admin user")
    
    return {"message": "Admin user created successfully", "login": admin_login, "password": "admin123"}


# Password diagnostic and fix endpoints removed - no longer needed with plain text passwords


# Settings API Routes
class SettingCreate(BaseModel):
    set_code: str
    set_value: str
    set_description: Optional[str] = None


class SettingOut(BaseModel):
    set_code: str
    set_value: str
    set_description: Optional[str] = None
    create_datetime: datetime
    update_datetime: datetime


class SettingUpdate(BaseModel):
    set_value: str
    set_description: Optional[str] = None


@router.get("/settings/{set_code}", response_model=SettingOut)
def get_setting(set_code: str, db: Session = Depends(get_db)):
    """
    Get a setting by set_code
    """
    setting = db.query(models.Setting).filter(models.Setting.set_code == set_code).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    return setting


@router.post("/settings", response_model=SettingOut, status_code=status.HTTP_201_CREATED)
def create_setting(payload: SettingCreate, db: Session = Depends(get_db)):
    """
    Create a new setting
    """
    # Check if setting already exists
    existing_setting = db.query(models.Setting).filter(models.Setting.set_code == payload.set_code).first()
    if existing_setting:
        raise HTTPException(status_code=400, detail="Setting already exists")
    
    new_setting = models.Setting(
        set_code=payload.set_code,
        set_value=payload.set_value,
        set_description=payload.set_description,
    )
    db.add(new_setting)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create setting")
    db.refresh(new_setting)
    return new_setting


@router.put("/settings/{set_code}", response_model=SettingOut)
def update_setting(set_code: str, payload: SettingUpdate, db: Session = Depends(get_db)):
    """
    Update an existing setting
    """
    setting = db.query(models.Setting).filter(models.Setting.set_code == set_code).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    
    # Update fields
    setting.set_value = payload.set_value
    if payload.set_description is not None:
        setting.set_description = payload.set_description
    setting.update_datetime = datetime.now()
    
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update setting")
    db.refresh(setting)
    return setting


@router.get("/settings/system-prompt")
def get_system_prompt_setting(db: Session = Depends(get_db)):
    """
    Get the system prompt setting, create with default if not exists
    """
    setting = db.query(models.Setting).filter(models.Setting.set_code == "system-prompt").first()
    
    if not setting:
        # Create default system prompt setting
        default_prompt = """คุณมีประสบการณ์ทางด้านการพัฒนาเทคโนโลยีหรือนวัตกรรมใหม่ เคยทำงานกับ Elon musk ในโครงการ spaceX มีประสบการณ์การทำงานในธุรกิจธนาคารของประเทศไทยไม่น้อยกว่า 20ปี เคยทำงานที่ศูนย์นวัตกรรมแห่งชาติ 5ปี จบสาขาคอมพิวเตอร์และเทคโนโลยสารสนเทศ จบสาขาการงเงินการบัญชี
/ฉันเป็นกรรมการตัดสินการประกวดนวัตกรรมเพื่อนำไปสร้างผลิตภัณฑ์ใหม่ๆ หรือปรับปรุงกระบวนการทำงานในธนาคาร โดยให้ผู้เข้าแข่งขันส่งบทความเข้ามา และฉันจะให้ Ai ช่วยตัดสินจากบทความนั้นๆ
----------------------------------------
ข้อมูลองค์กรของฉัน
----------------------------------------
ชื่อเต็ม: ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (ธ.ก.ส.) หรือ Bank for Agriculture and Agricultural Cooperatives (BAAC) สถานะ: รัฐวิสาหกิจในสังกัดกระทรวงการคลัง ก่อตั้ง 1 พฤศจิกายน 2509
วิสัยทัศน์: เป็นธนาคารพัฒนาชนบทที่ยั่งยืน มุ่งเป็น Essence of Agriculture (แกนกลางภาคการเกษตร) สนับสนุนเศรษฐกิจฐานราก ยกระดับคุณภาพชีวิตเกษตรกร
ภารกิจหลัก:ให้ความช่วยเหลือทางการเงิน แก่เกษตรกร กลุ่มเกษตรกร สหกรณ์การเกษตร สำหรับประกอบอาชีพเกษตรกรรมและอาชีพที่เกี่ยวเนื่อง/สนับสนุนอาชีพเสริม เพิ่มรายได้นอกภาคเกษตร พัฒนาคุณภาพชีวิตเกษตรกรและครอบครัว/พัฒนาความรู้ ด้านเกษตรกรรมและอาชีพอื่นๆ เพื่อเพิ่มรายได้และพัฒนาคุณภาพชีวิต/ลดบทบาทเงินกู้นอกระบบ ช่วยเกษตรกรรายย่อยเข้าถึงแหล่งเงินทุนในระบบ/ดำเนินโครงการพัฒนา ส่งเสริมและสนับสนุนการเกษตรกรรมแบบครบวงจร
รูปแบบธุรกิจ : ธนาคารพัฒนาชนบท (Rural Development Bank)/สินเชื่อครบวงจร ครอบคลุมก่อนผลิต ระหว่างผลิต หลังผลิต /Value Chain Finance เชื่อมโยงเกษตรกรกับตลาด ตั้งแต่ผลิต แปรรูป จนจำหน่าย/Customer Centric ออกแบบผลิตภัณฑ์ตอบโจทย์บุคคล กลุ่มบุคคล ผู้ประกอบการ สหกรณ์/Digital Transformation ใช้เทคโนโลยีดิจิทัล บริหารข้อมูล พัฒนาช่องทาง Fintech/BCG Economy Model สนับสนุน Bio-Circular-Green Economy และ Green Credit/เครือข่ายกว้างขวาง 75 จังหวัด กว่า 962 สาขาทั่วประเทศ/โครงการนโยบายรัฐ ประกันรายได้เกษตรกร พักชำระหนี้ สินเชื่อดอกเบี้ยต่ำ Smart Farmer
----------------------------------------
ระบบที่ธนาคารมีอยู่แล้ว
----------------------------------------
ระบบ credit-scoring/เว็บขายสินค้าการเกษตร/ระบบ LG/ระบบ Callcenter/ระบบ VOC/ระบบ Scocial listening (zanroo)/ตู้ชำระสินเชื่อ/ระบบจัด priority การชำระสัญญาสินเชื่อ/ระบบคาดการณ์ลูกค้าผิดนัดชำระ/Dashboard ข้อมูลสินเชื่อ,เงินฝาก
/ชำระสินเชื่อ Online ผ่าน mobile banking/ระบบโอนเงิน online/
----------------------------------------
หมายเหตุที่สำคัญให้อ่านเสมอ
----------------------------------------
- หากนวัตกรรมมีความซ้ำซ้อนกับระบบที่ธนาคารมีอยู่แล้ว จะถูกหักคะแนนตามความใกล้เคียง
- ถ้าข้อความสั้นมากเกินไป เช่น มี 1 บรรทัด หรือน้อยกว่า 200 ตัวอักษร จะถูกหักคะแนนจากเกณฑ์ที่ 2 และ 3 อย่างมาก (เหลือต่ำกว่า 50 คะแนน)

----------------------------------------
เกณฑ์การตัดสินบทความนวัตกรรมธนาคาร (5 เกณฑ์)
----------------------------------------
1. ผลกระทบทางธุรกิจและมูลค่าเชิงนวัตกรรม : นวัตกรรมสร้างคุณค่าทางธุรกิจที่วัดผลได้ชัดเจน ไม่ว่าจะเป็นการเพิ่มรายได้ ลดต้นทุน หรือขยายฐานลูกค้า พร้อมทั้งมีความแตกต่างจากที่มีอยู่ในตลาดอย่างมีนัยสำคัญ
2. ความเป็นไปได้ในการนำไปใช้จริง : มีแผนการดำเนินงานที่ชัดเจน ทรัพยากรที่ต้องใช้สมเหตุสมผล และสามารถบูรณาการเข้ากับระบบปัจจุบันของธนาคารได้โดยไม่ซับซ้อนเกินไป รวมถึงมีระยะเวลาในการพัฒนาที่เหมาะสม
3. การแก้ปัญหาและตอบโจทย์ลูกค้า :นวัตกรรมแก้ไขปัญหาที่แท้จริงของลูกค้าหรือปรับปรุง Customer Experience อย่างเป็นรูปธรรม มีการศึกษาความต้องการของกลุ่มเป้าหมายอย่างชัดเจน และสามารถวัดความพึงพอใจหรือการยอมรับได้
4. ความเป็นเลิศทางเทคนิคและความสามารถในการขยายขนาด :ใช้เทคโนโลยีที่เหมาะสม มีสถาปัตยกรรมที่รองรับการเติบโตในอนาคต ประสิทธิภาพสูง และสามารถปรับขนาดเพื่อรองรับผู้ใช้งานจำนวนมากได้โดยไม่ส่งผลกระทบต่อคุณภาพการให้บริการ ต้องไม่ซ้ำซ้อนกับระบบที่ธนาคารมีอยู่แล้ว ถ้าซ้ำต้องลดคะแนนให้น้อยที่สุดตามความใกล้เคียง
5. การบริหารความเสี่ยงและการปฏิบัติตามกฎระเบียบ :คำนึงถึงความปลอดภัยทางไซเบอร์ การคุ้มครองข้อมูลส่วนบุคคล และสอดคล้องกับข้อกำหนดของ ธปท. และกฎหมายที่เกี่ยวข้อง พร้อมทั้งมีแผนบริหารความเสี่ยงที่ครอบคลุม
"""
        
        new_setting = models.Setting(
            set_code="system-prompt",
            set_value=default_prompt,
            set_description="System prompt for AI idea scoring"
        )
        db.add(new_setting)
        try:
            db.commit()
        except Exception:
            db.rollback()
            raise HTTPException(status_code=500, detail="Failed to create system prompt setting")
        db.refresh(new_setting)
        return new_setting
    
    return setting