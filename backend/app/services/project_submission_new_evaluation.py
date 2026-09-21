from fastapi import HTTPException, status


EVALUATOR_ROLES = {
    "vp": {"admin", "superuser"},
    "committee": {"admin", "superuser_md"},
}


def require_project_submission_evaluation_role(current_user: dict, evaluator: str) -> None:
    """Enforce the same evaluator-role matrix as the IDEA Tank detail page."""
    allowed_roles = EVALUATOR_ROLES.get(evaluator)
    user_role = (current_user.get("payload", {}).get("role") or "").lower()
    if not allowed_roles or user_role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to save this evaluation",
        )
