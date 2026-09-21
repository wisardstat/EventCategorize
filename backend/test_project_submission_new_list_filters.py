import unittest
from pathlib import Path

from sqlalchemy import column
from app.db.schemas import ProjectSubmissionNewListItem, ProjectSubmissionNewListResponse

from app.services.project_submission_new_query import (
    apply_project_submission_score_order,
    apply_project_submission_score_status_filter,
)


class RecordingQuery:
    def __init__(self):
        self.filters = []
        self.ordering = []

    def filter(self, *expressions):
        self.filters.extend(expressions)
        return self

    def order_by(self, *expressions):
        self.ordering.extend(expressions)
        return self


class ProjectSubmissionNewListFilterTests(unittest.TestCase):
    def test_list_response_includes_both_manual_evaluation_statuses(self):
        for field in ("VpEvaluationStatus", "CommitteeEvaluationStatus"):
            with self.subTest(field=field):
                self.assertIn(field, ProjectSubmissionNewListItem.model_fields)
        self.assertEqual(
            ProjectSubmissionNewListResponse.model_fields["items"].annotation.__args__[0],
            ProjectSubmissionNewListItem,
        )

    def test_score_status_filters_rows_by_null_score(self):
        for status, expected in (
            ("scored", '"AiScore" IS NOT NULL'),
            ("unscored", '"AiScore" IS NULL'),
        ):
            with self.subTest(status=status):
                query = RecordingQuery()
                result = apply_project_submission_score_status_filter(
                    query,
                    column("AiScore"),
                    status,
                )

                self.assertIs(result, query)
                self.assertEqual([str(expression) for expression in query.filters], [expected])

    def test_score_order_is_null_last_and_uses_requested_direction(self):
        for direction in ("asc", "desc"):
            with self.subTest(direction=direction):
                query = RecordingQuery()
                apply_project_submission_score_order(
                    query,
                    column("AiScore"),
                    column("CreatedAt"),
                    column("ProjectId"),
                    direction,
                )

                ordering = [str(expression).upper() for expression in query.ordering]
                self.assertEqual(len(ordering), 4)
                self.assertIn("CASE WHEN", ordering[0])
                self.assertIn('"AISCORE" IS NULL', ordering[0])
                self.assertIn(f'"AISCORE" {direction.upper()}', ordering[1])
                self.assertIn('"CREATEDAT" DESC', ordering[2])
                self.assertIn('"PROJECTID" DESC', ordering[3])

    def test_list_and_export_routes_share_score_filters_and_ordering(self):
        routes_source = (Path(__file__).parent / "app" / "api" / "routes.py").read_text(
            encoding="utf-8"
        )
        for endpoint in ("export_project_submissions_new", "list_project_submissions_new"):
            with self.subTest(endpoint=endpoint):
                start = routes_source.index(f"def {endpoint}(")
                end = routes_source.find("\n\n@router.", start)
                route_source = routes_source[start:end]
                self.assertIn("score_status", route_source)
                self.assertIn("score_order", route_source)
                self.assertIn("apply_project_submission_score_status_filter(", route_source)
                self.assertIn("apply_project_submission_score_order(", route_source)

    def test_batch_scoring_honors_selected_score_status(self):
        routes_source = (Path(__file__).parent / "app" / "api" / "routes.py").read_text(
            encoding="utf-8"
        )
        start = routes_source.index("class ProjectSubmissionNewBatchScoreRequest")
        request_end = routes_source.find("\n\n\ndef ", start)
        request_source = routes_source[start:request_end]
        self.assertIn("score_status", request_source)

        start = routes_source.index("def batch_score_project_submissions_new(")
        end = routes_source.find("\n\n@router.", start)
        batch_source = routes_source[start:end]
        self.assertIn("apply_project_submission_score_status_filter(", batch_source)

    def test_export_adds_score_and_summary_columns(self):
        routes_source = (Path(__file__).parent / "app" / "api" / "routes.py").read_text(
            encoding="utf-8"
        )
        self.assertIn('"AiScore": "Score"', routes_source)
        self.assertIn('"AiIdeaSummary": "Summary"', routes_source)


if __name__ == "__main__":
    unittest.main()
