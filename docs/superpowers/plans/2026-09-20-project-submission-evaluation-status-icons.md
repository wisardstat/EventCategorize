# Project Submission Evaluation Status Icons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show VP and committee selection outcomes in separate project-list columns using a check for pass, an X for fail, and an empty cell for unset or non-final states.

**Architecture:** Include the existing nullable evaluation status columns in the list response schema. Render each status through a small accessible icon component in the existing table; no database migration is needed because the fields were added with manual evaluation support.

**Tech Stack:** FastAPI, Pydantic, Next.js, React, TypeScript, `react-icons/fa`, Node test runner.

## Global Constraints

- Pass status is exactly `ผ่านคัดเลือก`; fail status is exactly `ไม่ผ่านคัดเลือก`.
- All other statuses, including `null` and `ส่งแนวคิด`, render no icon or text.
- Keep VP and committee outcomes in distinct columns with accessible labels on icons.
- Do not change existing list filters, pagination, or export behavior.

---

### Task 1: Add list response fields and status icons

**Files:**
- Modify: `backend/app/db/schemas.py:500-513`
- Modify: `frontend/src/app/project_submission_new_list/page.tsx:13-21`
- Modify: `frontend/src/app/project_submission_new_list/page.tsx:297-325`
- Test: `backend/test_project_submission_new_list_filters.py`
- Test: `frontend/src/app/project_submission_new_list/page.filters.test.mjs`

**Interfaces:**
- `ProjectSubmissionNewListItem` adds nullable `VpEvaluationStatus` and `CommitteeEvaluationStatus` fields.
- A list row shows `FaCheck` for `ผ่านคัดเลือก`, `FaTimes` for `ไม่ผ่านคัดเลือก`, otherwise renders no icon.

- [x] Add regression tests for both response fields, both headers, pass/fail icon mapping, and blank rendering for unset/non-final statuses.
- [x] Run the targeted tests and confirm the assertions fail before implementing the behavior.
- [x] Add the response fields and accessible icons in the two table columns.
- [x] Run focused backend/Node tests, TypeScript, lint, and production build.
