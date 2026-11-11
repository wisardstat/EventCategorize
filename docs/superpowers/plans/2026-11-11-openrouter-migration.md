# OpenRouter Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Route all AI completions through OpenRouter without changing existing API endpoints.

**Architecture:** Add OpenRouter configuration and one client factory that wraps the OpenAI-compatible SDK. Replace direct OpenAI client construction in scoring, classification, and keyword extraction with that factory, using a configurable OpenRouter model.

**Tech Stack:** FastAPI, Python, `openai` SDK, `unittest`.

## Global Constraints

- Never log API keys.
- Use `https://openrouter.ai/api/v1` as the OpenRouter-compatible API base URL.
- Set credentials only through `backend/.env`; never commit secrets.

---

### Task 1: Add a testable OpenRouter client factory

**Files:**
- Create: `backend/app/services/llm_client.py`
- Create: `backend/test_openrouter_client.py`

**Interfaces:**
- Produces: `create_openrouter_client(settings_override=None) -> OpenAI`.

- [ ] **Step 1: Write the failing test**

```python
from types import SimpleNamespace
from unittest.mock import patch
from app.services.llm_client import create_openrouter_client

def test_create_openrouter_client_uses_openrouter_base_url():
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `backend\venv\Scripts\python.exe -m unittest backend.test_openrouter_client -v`

Expected: FAIL because `app.services.llm_client` does not exist.

- [ ] **Step 3: Write minimal implementation**

```python
def create_openrouter_client(settings_override=None):
    settings = settings_override or get_settings()
    headers = {"X-Title": settings.openrouter_app_name}
    return OpenAI(
        api_key=settings.openrouter_api_key,
        base_url=settings.openrouter_base_url,
        default_headers=headers,
    )
```

- [ ] **Step 4: Run test to verify it passes**

Run: `backend\venv\Scripts\python.exe -m unittest backend.test_openrouter_client -v`

Expected: PASS.

### Task 2: Migrate configuration and AI call sites

**Files:**
- Modify: `backend/app/core/config.py`
- Modify: `backend/app/services/openai_service.py`
- Modify: `backend/app/services/classifier.py`
- Modify: `backend/.env.example`

**Interfaces:**
- Consumes: `create_openrouter_client()` and `settings.openrouter_model`.
- Produces: existing scoring, classification, and keyword endpoints using OpenRouter.

- [ ] **Step 1: Replace OpenAI configuration with OpenRouter configuration**

```python
openrouter_api_key: str = ""
openrouter_base_url: str = "https://openrouter.ai/api/v1"
openrouter_model: str = "openai/gpt-4.1-mini"
openrouter_app_url: str = ""
openrouter_app_name: str = "EventCategorize"
```

- [ ] **Step 2: Use the factory at every completion call site**

```python
self.client = create_openrouter_client()
model=settings.openrouter_model
```

- [ ] **Step 3: Remove key and prompt debug prints from `classifier.py`**

```python
client = create_openrouter_client()
```

- [ ] **Step 4: Document environment variables**

```env
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=openai/gpt-4.1-mini
OPENROUTER_APP_NAME=EventCategorize
```

### Task 3: Validate migration

**Files:**
- Test: `backend/test_openrouter_client.py`

- [ ] **Step 1: Run the unit test**

Run: `backend\venv\Scripts\python.exe -m unittest backend.test_openrouter_client -v`

Expected: PASS.

- [ ] **Step 2: Compile backend sources**

Run: `backend\venv\Scripts\python.exe -m compileall app`

Expected: exit code 0.

- [ ] **Step 3: Configure the real secret outside Git**

Set `OPENROUTER_API_KEY` in `backend/.env`, restart the backend, then submit one answer to verify a real model response.
