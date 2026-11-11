from __future__ import annotations

import logging
from typing import Any

from openai import OpenAI

from app.core.config import get_settings

logger = logging.getLogger(__name__)


def create_openrouter_client(settings_override: Any = None) -> OpenAI:
    """Create an OpenAI-compatible client configured for OpenRouter."""
    settings = settings_override or get_settings()
    model = getattr(settings, "openrouter_model", "")
    headers = {"X-Title": settings.openrouter_app_name}
    if settings.openrouter_app_url:
        headers["HTTP-Referer"] = settings.openrouter_app_url

    logger.info(
        "OpenRouter client configured | base_url=%s | model=%s | api_key_configured=%s | app_name=%s",
        settings.openrouter_base_url,
        model,
        bool(settings.openrouter_api_key.strip()),
        settings.openrouter_app_name,
    )

    return OpenAI(
        api_key=settings.openrouter_api_key,
        base_url=settings.openrouter_base_url,
        default_headers=headers,
    )
