import unittest
import os
from pathlib import Path

os.environ["DEBUG"] = "false"

from app.services.authorization_service import AuthorizationService


class ProjectSubmissionNewDeletionContractTests(unittest.TestCase):
    def test_delete_permission_is_limited_to_administrators(self):
        self.assertTrue(
            AuthorizationService.check_role_permission("admin", "delete:project_submissions")
        )
        self.assertTrue(
            AuthorizationService.check_role_permission("super_admin", "delete:project_submissions")
        )
        self.assertFalse(
            AuthorizationService.check_role_permission("user", "delete:project_submissions")
        )

    def test_delete_route_is_registered(self):
        routes_source = (Path(__file__).parent / "app" / "api" / "routes.py").read_text(
            encoding="utf-8"
        )
        self.assertIn(
            '@router.delete("/project-submissions-new/{project_id}")',
            routes_source,
        )


if __name__ == "__main__":
    unittest.main()
