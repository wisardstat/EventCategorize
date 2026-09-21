import os
import unittest

os.environ["DEBUG"] = "false"

from fastapi import HTTPException

from app.db.models import ProjectSubmissionNew
from app.db.schemas import (
    ProjectSubmissionNewCommitteeEvaluationUpdate,
    ProjectSubmissionNewOut,
    ProjectSubmissionNewVpEvaluationUpdate,
)
from app.services.project_submission_new_evaluation import require_project_submission_evaluation_role


class ProjectSubmissionNewEvaluationTests(unittest.TestCase):
    def test_evaluation_fields_exist_on_model_and_detail_schema(self):
        names = (
            "VpEvaluationStatus",
            "VpEvaluationComment",
            "CommitteeEvaluationStatus",
            "CommitteeEvaluationComment",
        )
        for name in names:
            with self.subTest(name=name):
                self.assertTrue(hasattr(ProjectSubmissionNew, name))
                self.assertIn(name, ProjectSubmissionNewOut.model_fields)

    def test_vp_status_is_limited_to_idea_tank_choices(self):
        for status in ("ส่งแนวคิด", "ผ่านคัดเลือก", "ไม่ผ่านคัดเลือก", None):
            payload = ProjectSubmissionNewVpEvaluationUpdate(status=status, comment="ความเห็น")
            self.assertEqual(payload.status, status)
        with self.assertRaises(ValueError):
            ProjectSubmissionNewVpEvaluationUpdate(status="รอพิจารณา", comment=None)

    def test_committee_status_is_limited_to_idea_tank_choices(self):
        for status in ("ผ่านคัดเลือก", "ไม่ผ่านคัดเลือก", None):
            payload = ProjectSubmissionNewCommitteeEvaluationUpdate(status=status, comment=None)
            self.assertEqual(payload.status, status)
        with self.assertRaises(ValueError):
            ProjectSubmissionNewCommitteeEvaluationUpdate(status="ส่งแนวคิด", comment=None)

    def test_vp_roles_match_idea_tank_permissions(self):
        for role in ("admin", "superuser"):
            require_project_submission_evaluation_role({"payload": {"role": role}}, "vp")
        for role in ("user", "superuser_md", "super_admin"):
            with self.subTest(role=role), self.assertRaises(HTTPException) as error:
                require_project_submission_evaluation_role({"payload": {"role": role}}, "vp")
            self.assertEqual(error.exception.status_code, 403)

    def test_committee_roles_match_idea_tank_permissions(self):
        for role in ("admin", "superuser_md"):
            require_project_submission_evaluation_role(
                {"payload": {"role": role}}, "committee"
            )
        for role in ("user", "superuser", "super_admin"):
            with self.subTest(role=role), self.assertRaises(HTTPException) as error:
                require_project_submission_evaluation_role(
                    {"payload": {"role": role}}, "committee"
                )
            self.assertEqual(error.exception.status_code, 403)

    def test_both_authenticated_update_routes_are_registered(self):
        from pathlib import Path

        source = (Path(__file__).parent / "app" / "api" / "routes.py").read_text(
            encoding="utf-8"
        )
        self.assertIn(
            '@router.put("/project-submissions-new/{project_id}/vp-evaluation"', source
        )
        self.assertIn(
            '@router.put("/project-submissions-new/{project_id}/committee-evaluation"',
            source,
        )
        self.assertIn("Depends(get_current_user_with_permissions)", source)

    def test_migration_is_idempotent_backed_up_and_unicode(self):
        from pathlib import Path

        migration_source = (
            Path(__file__).parent / "migrate_project_submission_new_evaluations.py"
        ).read_text(encoding="utf-8")
        expected_columns = (
            "VpEvaluationStatus",
            "VpEvaluationComment",
            "CommitteeEvaluationStatus",
            "CommitteeEvaluationComment",
        )
        for name in expected_columns:
            with self.subTest(column=name):
                self.assertIn(f"COL_LENGTH('dbo.ProjectSubmissionNew', '{name}') IS NULL", migration_source)
                self.assertIn(f"{name} NVARCHAR(", migration_source)
                self.assertTrue(ProjectSubmissionNew.__table__.columns[name].nullable)
        self.assertIn("with engine.begin() as connection", migration_source)
        self.assertIn("SELECT * INTO dbo.[{backup_table}] FROM dbo.ProjectSubmissionNew", migration_source)


if __name__ == "__main__":
    unittest.main()
