import unittest
from types import SimpleNamespace

from diagnose_openrouter import configuration_summary


class OpenRouterDiagnoseTests(unittest.TestCase):
    def test_configuration_summary_never_contains_api_key(self):
        settings = SimpleNamespace(
            openrouter_api_key="sk-or-v1-secret-value",
            openrouter_base_url="https://openrouter.ai/api/v1",
            openrouter_model="openai/gpt-4.1-mini",
        )

        summary = configuration_summary(settings)

        self.assertEqual(summary["api_key_configured"], True)
        self.assertEqual(summary["base_url"], "https://openrouter.ai/api/v1")
        self.assertEqual(summary["model"], "openai/gpt-4.1-mini")
        self.assertNotIn("sk-or-v1-secret-value", str(summary))
