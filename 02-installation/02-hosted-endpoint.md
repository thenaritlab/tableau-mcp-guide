# 2.2 วิธีที่ง่ายที่สุด: Hosted Tableau MCP (mcp.tableau.com)

> ⏱️ เวลาที่ใช้: ~5 นาที | ระดับ: 🟢 Basic | เหมาะกับ: **Tableau Cloud เท่านั้น**

Tableau ให้บริการ MCP Server แบบ managed service ที่ `https://mcp.tableau.com` — ไม่ต้องติดตั้งอะไรบนเครื่องเลย ไม่ต้องมี Node.js ไม่ต้องสร้าง PAT ใช้ **OAuth 2.1** login ด้วยบัญชี Tableau Cloud ของคุณเอง และระบบจะเคารพ permission รายบุคคลโดยอัตโนมัติ

## ข้อดี / ข้อจำกัด

| ✅ ข้อดี | ❌ ข้อจำกัด |
|---|---|
| ติดตั้งใน 5 นาที ไม่ต้องลงอะไรบนเครื่อง | ใช้ได้กับ **Tableau Cloud เท่านั้น** (Server ใช้ไม่ได้) |
| OAuth — ไม่ต้องจัดการ PAT เอง | ต้องใช้ Claude **paid plan** (custom connector) |
| Permission ตาม user จริง เหมาะกับองค์กร | ปรับแต่ง config ฝั่ง server ไม่ได้ |
| Tableau ดูแล update ให้ตลอด | ต้องอนุญาต traffic ออกอินเทอร์เน็ต |

## ขั้นตอนบน Claude (Web หรือ Desktop)

### Step 1 — เปิดหน้า Connectors

1. เปิด Claude → คลิกรูปโปรไฟล์ → **Settings**
2. ไปที่เมนู **Connectors**
3. คลิก **Add custom connector**

### Step 2 — ใส่ URL

```
https://mcp.tableau.com
```

คลิก **Add**

### Step 3 — Sign in ด้วย OAuth

- Claude จะเปิดหน้า login ของ Tableau Cloud
- Login ด้วยบัญชีของคุณตามปกติ (รองรับ SSO ขององค์กรด้วย)
- กด **Allow / Authorize** เพื่ออนุญาตให้ Claude เข้าถึง

### Step 4 — ทดสอบ

เปิดแชทใหม่ แล้วลองถาม:

```
List all data sources available on my Tableau site
```

หรือภาษาไทย:

```
มี data source อะไรบ้างใน Tableau site ของฉัน
```

ถ้า Claude ตอบรายชื่อ data source กลับมา = สำเร็จ! 🎉

## ตัวอย่าง Prompt ที่ลองต่อได้ทันที

```
1. "For the Superstore datasource, what are the top 5 states by sales?"
2. "Find the most viewed workbook in the last 90 days"
3. "Show me the Pulse metrics I'm following"
4. "สรุปยอดขายรายเดือนจาก data source ชื่อ Sales_2026"
```

## ใช้กับ Client อื่นนอกจาก Claude

Hosted MCP ใช้ได้กับ MCP client อื่นด้วย เช่น Slack, ChatGPT, Cursor — ดูวิธี setup แต่ละตัวที่ [Popular Client Integrations](https://tableau.github.io/tableau-mcp/hosted-tableau-mcp/client-integrations) (เอกสารทางการ)

## คำถามที่พบบ่อย

**Q: ทำไมไม่เห็นเมนู Add custom connector?**
A: ฟีเจอร์นี้ต้องใช้ Claude paid plan (Pro/Team/Enterprise) และในบาง Team/Enterprise plan admin ต้องเปิดสิทธิ์ให้ก่อน

**Q: องค์กรใช้ Tableau Server (on-premise) ใช้วิธีนี้ได้ไหม?**
A: ไม่ได้ครับ Hosted MCP รองรับเฉพาะ Tableau Cloud — Tableau Server ต้องรัน MCP เอง ไปที่ [บท 2.3](03-claude-desktop-npx.md) หรือ [บท 2.5 (Docker)](05-docker-setup.md)

**Q: ข้อมูลจะรั่วไหม?**
A: การเข้าถึงข้อมูลผ่าน OAuth ตาม permission ของ user คนนั้น ๆ — Claude เห็นได้เท่าที่ user เห็นใน Tableau เท่านั้น อย่างไรก็ตาม ข้อมูลที่ query ออกมาจะเข้าไปอยู่ในบทสนทนากับ AI องค์กรควรกำหนดนโยบายว่าข้อมูลระดับไหน query ผ่าน AI ได้ (อ่านต่อ Part 6: Governance)

---

⬅️ [2.1 Prerequisites](01-prerequisites.md) | ➡️ [2.3 ติดตั้งบน Claude Desktop ด้วย npx](03-claude-desktop-npx.md)
