# 1.4 Tableau Cloud vs Tableau Server: เส้นทาง MCP ต่างกันอย่างไร

> ระดับ: 🟢 Basic | เวลาอ่าน: ~6 นาที

คำถามแรกที่ต้องตอบก่อนติดตั้ง: **องค์กรคุณใช้ Tableau Cloud หรือ Tableau Server?** เพราะตัวเลือกการติดตั้ง MCP ต่างกันชัดเจน

## ตารางเปรียบเทียบ

| | **Tableau Cloud** | **Tableau Server** (on-premise) |
|---|---|---|
| Hosted MCP (mcp.tableau.com) | ✅ ใช้ได้ — วิธีที่แนะนำ | ❌ ไม่รองรับ |
| Self-hosted MCP (npx/local/Docker) | ✅ ใช้ได้ | ✅ ใช้ได้ — ทางหลัก |
| Auth ที่ใช้ | OAuth 2.1 (hosted) หรือ PAT (self-hosted) | PAT (หรือ Connected App สำหรับงาน dev) |
| Per-user permission อัตโนมัติ | ✅ กับ OAuth | ต้องออกแบบเอง (PAT = สิทธิ์ของเจ้าของ token) |
| VizQL Data Service (VDS) | ✅ มีให้ | ต้องเป็นเวอร์ชัน 2024.2+ และเปิดใช้งาน |
| ความยุ่งยากในการเริ่ม | ⭐ (5 นาที) | ⭐⭐⭐ (ต้องรัน server เอง) |

## เส้นทางสำหรับผู้ใช้ Tableau Cloud

```
คุณใช้คนเดียว/ทดลอง?
├── ใช่ → Hosted MCP (บท 2.2) — เร็วสุด OAuth ปลอดภัยสุด
│         หรือ npx + PAT (บท 2.3) ถ้าองค์กรยังไม่อนุญาต custom connector
└── ทั้งทีมใช้ / จะสร้างแอป?
    ├── User ใช้ผ่าน Claude → Hosted MCP (ทุกคน login ตัวเอง สิทธิ์ตามจริง)
    └── สร้าง app/automation → Self-hosted HTTP (บท 2.5) + Claude API (Part 5)
```

**ข้อแนะนำ:** ถ้าใช้ Cloud ให้เริ่มจาก Hosted MCP เสมอ — เหตุผลหลักไม่ใช่แค่ความง่าย แต่คือ **OAuth ให้สิทธิ์ตาม user รายคน** ซึ่งตอบโจทย์ governance ขององค์กรได้ดีกว่า PAT ที่สิทธิ์ตายตัวตามเจ้าของ token

## เส้นทางสำหรับผู้ใช้ Tableau Server

Hosted MCP ใช้ไม่ได้ ต้อง self-host อย่างเดียว:

```
คุณใช้คนเดียว/ทดลอง?
├── ใช่ → npx + PAT บนเครื่องตัวเอง (บท 2.3)
└── ทั้งทีม/องค์กร → Docker ใน network องค์กร (บท 2.5 + Part 6)
```

**เช็คลิสต์เฉพาะ Tableau Server:**

- [ ] เวอร์ชัน **2024.2 ขึ้นไป** (VDS เริ่มมีตั้งแต่เวอร์ชันนี้) — เวอร์ชันเก่ากว่านี้ query data source ไม่ได้ ใช้ได้แค่กลุ่ม workbook/search
- [ ] เครื่องที่รัน MCP ต้องยิง HTTPS ถึง Tableau Server ได้ (เช็ค firewall ภายใน)
- [ ] ถ้า Server ใช้ SSL cert ภายในองค์กร → เตรียม `NODE_EXTRA_CA_CERTS` (ดูบท 2.7 ข้อ #8)
- [ ] นโยบายองค์กรอนุญาต PAT หรือไม่ — ถ้าไม่ ให้คุยกับ admin เรื่อง Connected App

> 💡 **สำหรับองค์กรที่วางแผนย้าย Server → Cloud:** ความพร้อมด้าน AI แบบนี้ (Hosted MCP, Pulse, Agent) เป็นหนึ่งในเหตุผลที่หลายองค์กรใช้ประกอบ business case การย้าย เพราะฟีเจอร์ AI ใหม่ ๆ ของ Tableau จะลง Cloud ก่อนเสมอ

## คำถามที่พบบ่อย

**Q: ใช้ทั้ง Cloud และ Server พร้อมกัน (hybrid) ได้ไหม?**
A: ได้ — ตั้ง MCP server 2 ชุดใน config เดียวกัน ตั้งชื่อต่างกัน เช่น `tableau-cloud` และ `tableau-server` แล้วบอก Claude ในคำถามว่าจะใช้ตัวไหน

**Q: Tableau Public ล่ะ?**
A: Tableau MCP ทางการไม่รองรับ Tableau Public (คนละ API กัน) — มี community MCP แยกสำหรับ Public แต่อยู่นอกขอบเขตคู่มือนี้

**Q: ต้องซื้อ license เพิ่มไหม?**
A: ตัว Tableau MCP เป็น open source ฟรี ใช้ license Tableau ที่มีอยู่ — แต่ user ที่ query ต้องมี site role ที่เหมาะสม (Explorer+) และฝั่ง AI ก็มีค่าใช้จ่ายของมันเอง (Claude plan หรือ API usage)

---

จบ Part 1 แล้ว! 🎉 ถ้ายังไม่ได้ติดตั้ง → [Part 2: Installation](../02-installation/01-prerequisites.md)
ติดตั้งแล้ว → [Part 3: Basic Usage](../03-basic-usage/01-first-conversation.md)
