
# AI Coding Guidelines 
> Stack: Next.js 14, TypeScript, PostgreSQL, Docker , FastAPI
> Version: 2.0.0

## Purpose
This document contains coding standards and instructions for AI agents 
working on this project. Follow these guidelines to ensure consistent, 
high-quality code generation.


# ❌ DO NOT USE (deprecated)
- เก็บ password แบบ plain text
- ห้ามมีภาษาจีนใน code

# ✅ ALWAYS USE (current pattern)
- ใช้ try-catch สำหรับทุก async operations
- ตรวจสอบ null/undefined ก่อนเข้าถึง properties
- มี error messages ที่ชัดเจนและเป็นประโยชน์
- ต้องมี JSDoc/TSDoc สำหรับ public functions" 
- อธิบาย complex logic
- ระบุ parameters และ return types


# ----------------------------------
# Run command Backend /ALWAYS USE (current pattern)
# ----------------------------------
cd backend ; ./.venv/Scripts/activate ; python -m pytest app/tests/ -v

# ----------------------------------
# Naming Conventions
# ----------------------------------
- Components: PascalCase (UserProfile.tsx)
- Functions: camelCase (getUserData)
- Constants: UPPER_SNAKE_CASE (API_BASE_URL)
- Files: kebab-case (user-profile.service.ts)

# ----------------------------------
# Verification Checklist
# ----------------------------------
Before completing, verify:
- [ ] Code compiles without errors
- [ ] All imports resolve correctly  
- [ ] Types are properly defined
- [ ] Error cases are handled

# ----------------------------------
## Response Length Rules ##
# ----------------------------------
## Summary Section Rules
- Maximum 50 tokens for all summaries
- Use bullet points only (no paragraphs)
- One line per change (max 10 words)
- No introductions ("Here's a summary...", "To summarize...")
- No conclusions ("In conclusion...", "Overall...")
- No code snippets in summary

## Required Format
### Summary:
- [Action]: [Result]
- [Action]: [Result]

## Examples
✅ GOOD (32 tokens):
Summary:
- Login: Added JWT validation
- API: Fixed timeout (5s → 30s)
- Tests: Updated auth tests

❌ BAD (89 tokens):
Summary:
I have successfully implemented JWT validation in the login 
system. Additionally, I fixed the timeout issue by increasing 
it from 5 seconds to 30 seconds. I also updated all the 
authentication tests to reflect these changes.