# Webapp Demo: Chat with your Tableau data

โค้ดประกอบ[บท 5.3](../../05-advanced-programming/03-build-chat-webapp.md) — Express backend เดิน tool loop เอง + หน้าแชทเรียบง่าย

## รัน

```bash
# 1) รัน Tableau MCP แบบ HTTP ก่อน (บท 2.5 — Docker หรือ TRANSPORT=http)
# 2)
cp .env.example .env      # ใส่ ANTHROPIC_API_KEY + TABLEAU_MCP_URL
npm install
npm start
# เปิด http://localhost:3000
```

## ลองถาม

- มี data source อะไรบ้าง
- Superstore มี field อะไรบ้าง
- Top 5 states by sales ปีนี้

## ⚠️ ข้อจำกัดของ demo

- History เก็บใน memory session เดียว (ทุกคนที่เปิดเว็บแชร์แชทเดียวกัน!)
- ไม่มี authentication — ห้ามเอาขึ้น internet ตามสภาพนี้
- ก่อนใช้จริง: ดูตาราง "จาก demo → production" ในบท 5.3 และ Part 6 ทั้งหมด
