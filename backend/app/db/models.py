from sqlalchemy import Column, Integer, Text, TIMESTAMP, text, String, DateTime
from sqlalchemy.sql.elements import quoted_name

from app.db.database import Base


class Question(Base):
    __tablename__ = quoted_name("Question", True)
    __table_args__ = {"schema": "dbo"}

    question_id = Column(String(100), primary_key=True, nullable=False)
    question_title = Column(String(500), nullable=False)
    question_description = Column(Text)
    question_categories = Column(Text)  # Changed from ARRAY(Text) to Text for MSSQL
    qrcode_url = Column(String(500))
    created_at = Column(
        DateTime, nullable=False, server_default=text("GETDATE()")
    )

    # No ORM relationship to Answer


class Answer(Base):
    __tablename__ = quoted_name("Answer", True)
    __table_args__ = {"schema": "dbo"}

    answer_id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    # Plain text field; no ForeignKey relation
    question_id = Column(String(255), nullable=False)
    answer_text = Column(Text, nullable=False)
    category = Column(String(255), nullable=False)
    create_user_name = Column(String(255))
    create_user_code = Column(String(100))
    create_user_department = Column(String(255))
    answer_keywords = Column(Text)
    created_at = Column(
        DateTime, nullable=False, server_default=text("GETDATE()")
    )
    # No ORM relationship to Question


class IdeaTank(Base):
    __tablename__ = quoted_name("idea_tank", True)
    __table_args__ = {"schema": "dbo"}

    idea_seq = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    idea_code = Column(String(10))
    category_idea_type1 = Column(String(100))
    idea_name = Column(String(500))
    idea_subject = Column(Text)
    idea_source = Column(Text)
    customer_target = Column(Text)
    idea_inno_type = Column(Text)
    idea_detail = Column(Text)
    idea_finance_impact = Column(Text)
    idea_nonfinance_impact = Column(Text)
    idea_status = Column(Text)
    idea_status_md = Column(String(50))
    idea_status_md_remark = Column(Text)
    idea_owner_empcode = Column(String(50))
    idea_owner_empname = Column(String(200))
    idea_owner_deposit = Column(String(100))
    idea_owner_contacts = Column(String(200))
    idea_keywords = Column(Text)
    idea_comment = Column(Text)
    idea_summary_byai = Column(Text)
    idea_score = Column(Integer, nullable=True)
    idea_score_comment = Column(Text, nullable=True)
    create_datetime = Column(
        DateTime, nullable=False, server_default=text("GETDATE()")
    )
    update_datetime = Column(
        DateTime, nullable=False, server_default=text("GETDATE()")
    )




class User(Base):
    __tablename__ = quoted_name("idea_users", True)
    __table_args__ = {"schema": "dbo"}

    user_code = Column(String(50), primary_key=True, nullable=False)
    user_fname = Column(String(100), nullable=False)
    user_lname = Column(String(100), nullable=False)
    user_login = Column(String(50), unique=True, nullable=False)
    user_password = Column(String(255), nullable=False)
    user_createdate = Column(
        DateTime, nullable=False, server_default=text("GETDATE()")
    )
    user_updatedate = Column(
        DateTime, nullable=False, server_default=text("GETDATE()")
    )
    user_role = Column(String(50), nullable=True, default='user')


class Setting(Base):
    __tablename__ = quoted_name("tb_setting", True)
    __table_args__ = {"schema": "dbo"}

    set_code = Column(String(50), primary_key=True, nullable=False)
    set_name = Column(String(255), nullable=True)
    set_value = Column(Text, nullable=False)
    set_description = Column(Text, nullable=True)
    create_datetime = Column(
        DateTime, nullable=False, server_default=text("GETDATE()")
    )
    update_datetime = Column(
        DateTime, nullable=False, server_default=text("GETDATE()")
    )
