from sqlalchemy import case


def apply_project_submission_score_status_filter(query, score_column, score_status):
    if score_status == "scored":
        return query.filter(score_column.is_not(None))
    if score_status == "unscored":
        return query.filter(score_column.is_(None))
    return query


def apply_project_submission_score_order(
    query,
    score_column,
    created_at_column,
    project_id_column,
    score_order,
):
    score_order_expression = score_column.asc() if score_order == "asc" else score_column.desc()
    return query.order_by(
        case((score_column.is_(None), 1), else_=0),
        score_order_expression,
        created_at_column.desc(),
        project_id_column.desc(),
    )
