# 1.2 Tableau MCP คืออะไร + Architecture

> ระดับ: 🟢 Basic | เวลาอ่าน: ~10 นาที

## Tableau MCP คืออะไร

**Tableau MCP** คือ MCP Server **อย่างเป็นทางการจาก Tableau** (อยู่ใน GitHub org ของ Tableau เอง: [tableau/tableau-mcp](https://github.com/tableau/tableau-mcp), license Apache-2.0) สโลแกนของโปรเจกต์คือ *"Helping agents see and understand data"* — ช่วยให้ AI agent มองเห็นและเข้าใจข้อมูล

พูดแบบใช้งานจริง: มันทำให้คุณ **"คุยกับ Tableau ได้"** —

```
คุณ:    "เดือนนี้ยอดขายภาคไหนตกบ้าง เทียบกับเดือนที่แล้ว"
Claude: [query ข้อมูลจริงจาก data source ใน Tableau Cloud ของคุณ]
        "ภาคเหนือตก 12% และภาคใต้ตก 3% ครับ โดยภาคเหนือตกหนักสุดใน
         หมวดสินค้า Electronics ส่วนภาคกลางกับอีสานยังเติบโต..."
```

ไม่ต้อง export ไฟล์ ไม่ต้องเปิด dashboard ไม่ต้องเขียน SQL — ข้อมูลที่ตอบคือข้อมูลสด ณ ตอนถาม ตามสิทธิ์การเข้าถึงของคุณ

## Tableau MCP ทำอะไรได้ (ภาพรวม)

ความสามารถแบ่งเป็น 4 กลุ่มหลัก:

| กลุ่ม | ทำอะไรได้ | API เบื้องหลัง |
|---|---|---|
| 🗄️ **Data Sources** | ค้นหา data source, ดู field/metadata, **query ข้อมูลด้วยเงื่อนไขต่าง ๆ** | VizQL Data Service (VDS) + Metadata API |
| 📊 **Workbooks & Views** | ค้นหา workbook, ดูรายละเอียด view, ดึงข้อมูล/ภาพจาก view | REST API |
| 💓 **Pulse** | อ่าน metric definitions, metrics, subscriptions, insight bundle (AI insights) | Pulse API |
| 🔍 **Search** | ค้นหา content ทุกประเภทข้าม site | Search API |

รายละเอียด tool ทีละตัวอยู่ที่ [บท 3.2](../03-basic-usage/02-available-tools.md)

> 📌 **ขอบเขตสำคัญ:** Tableau MCP เน้นการ**อ่านและวิเคราะห์** — มันไม่ได้ออกแบบมาแทน Tableau Desktop ในการสร้าง workbook และไม่ใช่เครื่องมือ migrate content

## Architecture

### แบบที่ 1: รัน Local (stdio) — ใช้คนเดียว

```
┌──────────────────┐   stdio    ┌──────────────────┐   HTTPS   ┌──────────────────┐
│  Claude Desktop   │ ◄───────► │   Tableau MCP     │ ◄───────► │  Tableau Cloud    │
│  (MCP Client)     │  JSON-RPC │   (Node process)  │  REST/VDS │  หรือ Server       │
└──────────────────┘           └──────────────────┘   + PAT    └──────────────────┘
        เครื่องคุณ                     เครื่องคุณ                      ระบบ Tableau
```

- Claude Desktop เป็นคน **spawn process** ของ MCP server ขึ้นมาเอง (ตาม config)
- คุยกันผ่าน **stdio** (standard input/output) ด้วยภาษา JSON-RPC
- MCP server ใช้ **PAT** login เข้า Tableau แล้วแปลงคำขอของ AI เป็น REST API / VDS calls
- ทุกอย่างอยู่บนเครื่องคุณ ยกเว้นตัว Tableau — เหมาะกับใช้ส่วนตัว, POC, พัฒนา

### แบบที่ 2: Hosted MCP (mcp.tableau.com) — Cloud เท่านั้น

```
┌──────────────────┐   HTTPS + OAuth 2.1   ┌──────────────────┐        ┌──────────────────┐
│  Claude (Web/App) │ ◄──────────────────► │  mcp.tableau.com  │ ◄────► │  Tableau Cloud    │
└──────────────────┘                       └──────────────────┘        └──────────────────┘
                                            Tableau ดูแลให้ทั้งหมด
```

- ไม่ต้องติดตั้งอะไรเลย — Tableau รัน server ให้เป็น managed service
- Login ด้วย **OAuth 2.1** = สิทธิ์ตาม user จริงรายคน ไม่ต้องแจก PAT
- เหมาะกับองค์กรที่ใช้ Tableau Cloud และอยากให้ user ทั่วไปใช้ได้ง่าย ๆ

### แบบที่ 3: Self-hosted HTTP — ทีม/องค์กร (รวม Tableau Server)

```
┌─────────────┐
│ Claude เครื่อง A│──┐
├─────────────┤  │   HTTPS    ┌──────────────────┐        ┌──────────────────┐
│ Claude เครื่อง B│──┼─────────► │  Tableau MCP      │ ◄────► │  Tableau Server   │
├─────────────┤  │  (+auth)   │  (Docker/VM)      │        │  หรือ Cloud        │
│ Web App/API  │──┘            └──────────────────┘        └──────────────────┘
└─────────────┘                 ตั้งใน network องค์กร
```

- รัน MCP server เป็น service กลาง (transport: **streamable-http**)
- รองรับ Tableau Server on-premise ที่ Hosted MCP ไม่รองรับ
- ต้องดูแล security เอง (ดู Part 6)

## เดินทางของ 1 คำถาม (ไล่ทีละขั้น)

สมมติถามว่า *"Top 5 จังหวัดที่ยอดขายสูงสุดใน data source Superstore"*:

```
1. Claude Desktop ส่งคำถามให้ Claude (LLM)
2. Claude เห็นรายการ tools ของ Tableau MCP ที่ประกาศไว้ → เลือกใช้
3. Claude → MCP: เรียก list-fields (ขอดูโครงสร้าง Superstore ก่อน)
4. MCP → Tableau: ยิง Metadata API → ได้ fields กลับมา
5. Claude → MCP: เรียก query-datasource พร้อมโครง query
   { fields: [จังหวัด, SUM(ยอดขาย)], sort: desc, limit: 5 }
6. MCP → Tableau: แปลงเป็น VDS query → Tableau ประมวลผล → ส่งผลกลับ
7. Claude ได้ตัวเลข → เรียบเรียงเป็นภาษาคน + วิเคราะห์เพิ่ม → ตอบคุณ
```

สังเกตว่า **Claude ไม่เคยเห็นข้อมูลทั้งก้อน** — เห็นเฉพาะผลลัพธ์ของ query ที่ขอ (เหมือน analyst ที่ยิง SQL เฉพาะที่จำเป็น) นี่คือเหตุผลที่ MCP ปลอดภัยกว่าการ export ทั้งไฟล์ให้ AI

## สิ่งที่ต้องมีฝั่ง Tableau

| รายการ | จำเป็น? |
|---|---|
| Tableau Cloud หรือ Tableau Server (เวอร์ชันที่มี VDS — 2024.2+) | ✅ |
| **Published data source** (ไม่ใช่ embedded ใน workbook) | ✅ สำหรับการ query |
| PAT หรือบัญชีที่ login OAuth ได้ | ✅ |
| Tableau Pulse เปิดใช้งาน | เฉพาะถ้าจะใช้กลุ่ม Pulse tools |

> 💡 **จุดที่คนพลาดบ่อยที่สุด:** data source ต้องเป็นแบบ **published** แยกออกมา ไม่ใช่ data source ที่ฝังอยู่ใน workbook — ถ้า query ไม่เจอข้อมูลทั้งที่ "ก็เห็นอยู่ใน dashboard" ให้เช็คข้อนี้ก่อนเลย

อ่านต่อ: [1.3 Use Cases →](03-use-cases.md)
