from sqlalchemy import Column, Integer, Text, TIMESTAMP, text, String
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
    create_user_name = Column(Text)
    create_user_code = Column(Text)
    create_user_department = Column(Text)
    answer_keywords = Column(Text)
    created_at = Column(
        TIMESTAMP(timezone=False), nullable=False, server_default=text("CURRENT_TIMESTAMP")
    )
    # No ORM relationship to Question


class IdeaTank(Base):
    __tablename__ = quoted_name("idea_tank", True)
    __table_args__ = {"schema": "public"}

    idea_seq = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    idea_code = Column(String(10))
    category_idea_type1 = Column(String(5000))
    idea_name = Column(String(5000))
    idea_subject = Column(String(5000))
    idea_source = Column(String(5000))
    customer_target = Column(String(5000))
    idea_inno_type = Column(String(5000))
    idea_detail = Column(Text)
    idea_finance_impact = Column(Text)
    idea_nonfinance_impact = Column(Text)
    idea_status = Column(String(5000))
    idea_owner_empcode = Column(String(5000))
    idea_owner_empname = Column(String(5000))
    idea_owner_deposit = Column(String(5000))
    idea_owner_contacts = Column(String(5000))
    idea_keywords = Column(String(5000))
    idea_comment = Column(String(5000))
    idea_summary_byai = Column(Text)
    create_datetime = Column(
        TIMESTAMP(timezone=False), nullable=False, server_default=text("CURRENT_TIMESTAMP")
    )
    update_datetime = Column(
        TIMESTAMP(timezone=False), nullable=False, server_default=text("CURRENT_TIMESTAMP")
    )





class User(Base):
    __tablename__ = quoted_name("idea_users", True)
    __table_args__ = {"schema": "public"}

    user_code = Column(String(50), primary_key=True, nullable=False)
    user_fname = Column(String(100), nullable=False)
    user_lname = Column(String(100), nullable=False)
    user_login = Column(String(50), unique=True, nullable=False)
    user_password = Column(String(255), nullable=False)
    user_createdate = Column(
        TIMESTAMP(timezone=False), nullable=False, server_default=text("CURRENT_TIMESTAMP")
    )
    user_updatedate = Column(
        TIMESTAMP(timezone=False), nullable=False, server_default=text("CURRENT_TIMESTAMP")
    )
