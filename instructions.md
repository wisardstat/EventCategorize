
# AI Coding Guidelines 
> Stack: Next.js 14, TypeScript, PostgreSQL, Docker , FastAPI
> Version: 2.0.0

## Purpose
This document contains coding standards and instructions for AI agents 
working on this project. Follow these guidelines to ensure consistent, 
high-quality code generation.

*** Important : Use Thai language ###

# โ DO NOT USE (deprecated)
- เน€เธเนเธ password เนเธเธ plain text
- เธซเนเธฒเธกเธกเธตเธ เธฒเธฉเธฒเธเธตเธเนเธ code

# โ… ALWAYS USE (current pattern)
- เนเธซเนเธชเธทเนเธญเธชเธฒเธฃเธเธฑเธเธเธฑเธเนเธ”เธขเนเธเนเธ เธฒเธฉเธฒเนเธ—เธข
- เนเธเน try-catch เธชเธณเธซเธฃเธฑเธเธ—เธธเธ async operations
- เธ•เธฃเธงเธเธชเธญเธ null/undefined เธเนเธญเธเน€เธเนเธฒเธ–เธถเธ properties
- เธกเธต error messages เธ—เธตเนเธเธฑเธ”เน€เธเธเนเธฅเธฐเน€เธเนเธเธเธฃเธฐเนเธขเธเธเน
- เธ•เนเธญเธเธกเธต JSDoc/TSDoc เธชเธณเธซเธฃเธฑเธ public functions" 
- เธญเธเธดเธเธฒเธข complex logic
- เธฃเธฐเธเธธ parameters เนเธฅเธฐ return types


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
โ… GOOD (32 tokens):
Summary:
- Login: Added JWT validation
- API: Fixed timeout (5s โ’ 30s)
- Tests: Updated auth tests

โ BAD (89 tokens):
Summary:
I have successfully implemented JWT validation in the login 
system. Additionally, I fixed the timeout issue by increasing 
it from 5 seconds to 30 seconds. I also updated all the 
authentication tests to reflect these changes.
# ----------------------------------
# Encoding / Mojibake Issue
# ----------------------------------
## ปัญหาที่พบ
- ข้อความภาษาไทยแสดงผลเพี้ยน เช่น `"เธงเธเนเธญเธเธ"` และอ่านไม่ออก

## สาเหตุที่พบบ่อย
- ไฟล์ถูกเปิด/บันทึกด้วย encoding ที่ไม่ใช่ UTF-8
- ใช้เครื่องมือแก้ไฟล์ที่เขียนทับ encoding เดิมโดยไม่ตั้งค่า encoding ชัดเจน
- คัดลอกข้อความผ่าน terminal/editor ที่ใช้ code page ต่างกัน

## แนวทางแก้ไข (ต้องทำ)
- ให้ใช้ `UTF-8` เป็นมาตรฐานทุกไฟล์ข้อความ (`.ts`, `.tsx`, `.py`, `.md`, `.sql`)
- เวลาบันทึกไฟล์ให้ตั้งค่าเป็น `UTF-8` (แนะนำไม่ใช้ BOM เว้นแต่ระบบปลายทางบังคับ)
- ถ้าเห็นข้อความเพี้ยน ให้แปลงไฟล์กลับเป็น UTF-8 แล้วตรวจทานข้อความไทยอีกครั้ง
- หลีกเลี่ยงการใช้คำสั่งหรือ script ที่ไม่ระบุ encoding ตอนเขียนไฟล์
- หลังแก้ไข ให้ re-open ไฟล์และยืนยันว่าข้อความไทยอ่านได้ปกติ

## หมายเหตุสำหรับ AI Agent
- หากพบข้อความลักษณะ mojibake ให้รายงานในสรุปงานว่าเป็นปัญหา encoding
- ห้ามส่งมอบงานที่มีข้อความไทยเพี้ยนโดยไม่แก้ไข