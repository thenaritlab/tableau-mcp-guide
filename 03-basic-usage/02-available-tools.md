# 3.2 Tools ทั้งหมดของ Tableau MCP

> ระดับ: 🟢 Basic | เวลาอ่าน: ~10 นาที

Tools คือ "การกระทำ" ที่ Claude เรียกใช้ได้ — เข้าใจว่ามีอะไรบ้างจะช่วยให้ (1) ถามคำถามได้ตรงความสามารถจริง (2) ควบคุมสิทธิ์ได้ละเอียด (INCLUDE/EXCLUDE_TOOLS) (3) debug ได้ว่า AI เรียกอะไรผิด

> ⚠️ **สำคัญ:** Tableau MCP ออก release ถี่ ชื่อและจำนวน tools **เปลี่ยนได้ตลอด** — บทนี้จัดกลุ่มตามหมวดความสามารถซึ่งค่อนข้างนิ่ง ส่วนรายชื่อ tool ตรงเวอร์ชันที่คุณใช้ ให้ดูของจริงด้วยวิธีท้ายบท

## หมวด 1: Data Sources 🗄️ (ใช้บ่อยสุด)

หัวใจของ "คุยกับข้อมูล" — ทำงานผ่าน VizQL Data Service (VDS) และ Metadata API

| Tool (ชื่อโดยประมาณ) | ทำอะไร | ตัวอย่างคำถามที่ trigger |
|---|---|---|
| `list-datasources` | รายชื่อ published data source ใน site | "มี data source อะไรบ้าง" |
| `list-fields` | field ทั้งหมดของ data source + ชนิดข้อมูล + aggregation | "Superstore มี field อะไรบ้าง" |
| `read-metadata` | metadata เชิงลึก รวม description ของ column | "field นี้หมายถึงอะไร" |
| `query-datasource` | **query ข้อมูลจริง** — เลือก field, filter, aggregate, sort | "ยอดขาย top 5 จังหวัด" |

`query-datasource` คือพระเอกตัวจริง — รับโครง query เป็น JSON (fields + filters) แล้ว VDS ประมวลผลฝั่ง Tableau รายละเอียดโครงสร้าง query เชิงลึกอยู่ที่ Part 5.6 (VDS Deep Dive)

## หมวด 2: Workbooks & Views 📊

ทำงานผ่าน REST API — สำรวจ content ที่มีอยู่แล้ว

| Tool (ชื่อโดยประมาณ) | ทำอะไร | ตัวอย่างคำถาม |
|---|---|---|
| list/get workbooks | รายชื่อ + รายละเอียด workbook | "มี workbook อะไรใน project Sales" |
| list views | รายชื่อ view ใน workbook | "workbook นี้มีหน้าอะไรบ้าง" |
| view data | ดึงข้อมูลเบื้องหลัง view | "ขอข้อมูลดิบของ view นี้" |
| view image | ดึงภาพ view มาแสดง | "ขอดูหน้าตา dashboard Economy" |

> 💡 view image มีประโยชน์เกินคาด — ให้ AI "เห็น" dashboard แล้ววิจารณ์ design หรืออธิบาย chart ให้คนใหม่ฟังได้

## หมวด 3: Pulse 💓

สำหรับองค์กรที่ใช้ Tableau Pulse (Cloud)

| Tool (ชื่อโดยประมาณ) | ทำอะไร |
|---|---|
| list metric definitions | นิยาม metric ทั้งหมดใน site |
| list metrics | metric ทั้งหมดภายใต้ definition หนึ่ง |
| get metrics by ID | รายละเอียด metric เฉพาะตัว |
| list subscriptions | metric ที่ user คนนี้ follow อยู่ |
| **generate insight bundle** | ค่าปัจจุบัน + trend + **AI-generated insights** ของ metric |

Insight bundle คือของเด็ด — เท่ากับได้คำวิเคราะห์ของ Pulse มาให้ Claude เรียบเรียงต่ออีกชั้น เช่น *"สรุป insight ของทุก metric ที่ฉัน follow เป็นรายงานเช้าวันจันทร์"* (ลงลึกในบท 3.5)

## หมวด 4: Search 🔍

| Tool (ชื่อโดยประมาณ) | ทำอะไร |
|---|---|
| search content | ค้นหาข้าม content ทุกประเภท (workbook, view, datasource, project) ด้วย keyword |

เหมาะกับ site ใหญ่ ๆ ที่จำไม่ได้ว่าของอยู่ไหน: *"หา workbook เกี่ยวกับ marketing funnel ให้หน่อย"*

## ดูรายชื่อ tools จริงของเวอร์ชันที่คุณใช้

### วิธีที่ 1 — ถาม Claude ตรง ๆ (ง่ายสุด)

```
list all Tableau MCP tools you have access to, with a one-line description of each
```

### วิธีที่ 2 — MCP Inspector (ละเอียดสุด เห็น parameter ด้วย)

```bash
cd tableau-mcp
npm run inspect
# เปิด browser → Tools → List Tools
```

### วิธีที่ 3 — เอกสารทางการ

https://tableau.github.io/tableau-mcp/ (อัปเดตตาม release เสมอ)

## การจำกัด tools (ทบทวนจากบท 2.3)

use case ที่เจอบ่อยในองค์กร: เปิดเฉพาะ read-only query ให้ user ทั่วไป

```json
"env": {
  "INCLUDE_TOOLS": "list-datasources,list-fields,query-datasource"
}
```

หลักคิด: **เปิดน้อยที่สุดที่งานต้องการ** — นอกจากปลอดภัยแล้ว ยังทำให้ AI เลือก tool แม่นขึ้นด้วย (ตัวเลือกน้อย สับสนน้อย)

---

⬅️ [3.1 บทสนทนาแรก](01-first-conversation.md) | ➡️ [3.3 Query Data Source](03-query-datasource.md)
