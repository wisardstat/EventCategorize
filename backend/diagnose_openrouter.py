"""Diagnose OpenRouter configuration and connectivity without making model requests."""

from __future__ import annotations

import argparse
import logging
from typing import Any

import httpx

from app.core.config import get_settings

logger = logging.getLogger("openrouter.diagnose")


def configuration_summary(settings: Any) -> dict[str, object]:
    """Return diagnostic configuration fields without exposing credentials."""
    return {
        "base_url": settings.openrouter_base_url.rstrip("/"),
        "model": settings.openrouter_model,
        "api_key_configured": bool(settings.openrouter_api_key.strip()),
    }


def request_status(url: str, headers: dict[str, str] | None = None) -> int:
    response = httpx.get(url, headers=headers, timeout=15.0)
    return response.status_code


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--auth-check",
        action="store_true",
        help="Check OpenRouter key authentication without invoking a model.",
    )
    args = parser.parse_args()

    try:
        settings = get_settings()
    except Exception:
        logger.exception("Unable to load Backend configuration; fix the reported .env value before testing OpenRouter")
        return 1
    summary = configuration_summary(settings)
    logger.info(
        "OpenRouter configuration | base_url=%s | model=%s | api_key_configured=%s",
        summary["base_url"],
        summary["model"],
        summary["api_key_configured"],
    )

    try:
        models_status = request_status(f"{summary['base_url']}/models")
        logger.info("OpenRouter connectivity | endpoint=/models | status=%s", models_status)
    except httpx.HTTPError:
        logger.exception("OpenRouter connectivity failed | endpoint=/models")
        return 1

    if not 200 <= models_status < 300:
        logger.error("OpenRouter connectivity returned an unexpected status=%s", models_status)
        return 1

    if not args.auth_check:
        return 0

    if not summary["api_key_configured"]:
        logger.error("OpenRouter authentication skipped: OPENROUTER_API_KEY is not configured")
        return 1

    try:
        auth_status = request_status(
            f"{summary['base_url']}/auth/key",
            headers={"Authorization": f"Bearer {settings.openrouter_api_key}"},
        )
        logger.info("OpenRouter authentication | endpoint=/auth/key | status=%s", auth_status)
    except httpx.HTTPError:
        logger.exception("OpenRouter authentication request failed | endpoint=/auth/key")
        return 1

    return 0 if 200 <= auth_status < 300 else 1


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s:%(name)s:%(message)s")
    raise SystemExit(main())
