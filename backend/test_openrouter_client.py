from types import SimpleNamespace
import unittest
from unittest.mock import patch

from app.services.llm_client import create_openrouter_client


class OpenRouterClientTests(unittest.TestCase):
    def test_create_openrouter_client_uses_openrouter_base_url(self):
        settings = SimpleNamespace(
            openrouter_api_key="test-key",
            openrouter_base_url="https://openrouter.ai/api/v1",
            openrouter_app_url="",
            openrouter_app_name="EventCategorize",
        )

        with patch("app.services.llm_client.OpenAI") as client:
            create_openrouter_client(settings)

        client.assert_called_once_with(
            api_key="test-key",
            base_url="https://openrouter.ai/api/v1",
            default_headers={"X-Title": "EventCategorize"},
        )
