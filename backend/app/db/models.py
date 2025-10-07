from sqlalchemy import Column, Integer, Text, TIMESTAMP, text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.sql.elements import quoted_name

from app.db.database import Base


class Question(Base):
    __tablename__ = quoted_name("Question", True)
    __table_args__ = {"schema": "public"}

    question_id = Column(Text, primary_key=True, nullable=False)
    question_title = Column(Text, nullable=False)
    question_description = Column(Text)
    question_categories = Column(ARRAY(Text))
    qrcode_url = Column(Text)
    created_at = Column(
        TIMESTAMP(timezone=False), nullable=False, server_default=text("CURRENT_TIMESTAMP")
    )

    # No ORM relationship to Answer


class Answer(Base):
    __tablename__ = quoted_name("Answer", True)
    __table_args__ = {"schema": "public"}

    answer_id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    # Plain text field; no ForeignKey relation
    question_id = Column(Text, nullable=False)
    answer_text = Column(Text, nullable=False)
    category = Column(Text, nullable=False)
    created_at = Column(
        TIMESTAMP(timezone=False), nullable=False, server_default=text("CURRENT_TIMESTAMP")
    )

    # No ORM relationship to Question


