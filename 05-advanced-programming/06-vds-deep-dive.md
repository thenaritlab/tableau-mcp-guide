# 5.6 VizQL Data Service (VDS) Deep Dive

> ระดับ: 🔴 Advanced | ประโยชน์: debug query ของ AI ได้, เขียน query เองใน custom tool ได้

`query-datasource` ของ MCP คือ wrapper บาง ๆ ครอบ **VizQL Data Service (VDS)** — เข้าใจ VDS = อ่าน query ที่ AI ประกอบออก, รู้ว่าทำไมบางคำถามถึงพลาด, และเขียน query แม่น ๆ เองได้ในบท 5.4

## VDS คืออะไร

HTTP API สำหรับ query **published data source** โดยตรงแบบ headless (ไม่ต้องมี viz) — endpoint หลัก:

```
POST {server}/api/v1/vizql-data-service/query-datasource
POST {server}/api/v1/vizql-data-service/read-metadata
```

มีใน Tableau Cloud และ Tableau Server 2024.2+ — query เป็น JSON ประกอบด้วย 2 ส่วนหลัก: `fields` และ `filters`

## โครงสร้าง Query

### Fields: เลือกอะไร + aggregate อย่างไร

```json
{
  "datasource": { "datasourceLuid": "abc-123-..." },
  "query": {
    "fields": [
      { "fieldCaption": "Region" },
      { "fieldCaption": "Sales", "function": "SUM", "fieldAlias": "TotalSales" },
      { "fieldCaption": "Order Date", "function": "YEAR" }
    ]
  }
}
```

- ไม่ใส่ `function` = ใช้เป็น dimension (group by อัตโนมัติ)
- `function` ที่ใช้บ่อย: `SUM`, `AVG`, `MIN`, `MAX`, `COUNT`, `COUNTD` และฟังก์ชันวันที่ `YEAR`, `QUARTER`, `MONTH`, `WEEK`, `DAY`, `TRUNC_*`
- หลักเดียวกับลาก pill ใน Tableau: dimension ทั้งหมด = ระดับ detail ของผลลัพธ์

### Sort + Top N

```json
{ "fieldCaption": "Sales", "function": "SUM",
  "sortDirection": "DESC", "sortPriority": 1 }
```

Top N ทำผ่าน filter แบบ TOP (ด้านล่าง) — นี่คือจุดที่ AI ชอบพลาดเวลาถาม "top 5": บางทีมัน sort แล้วตัดเอง แทนที่จะใช้ TOP filter — ผลอาจต่างกันเมื่อมี tie

### Filters: หัวใจของความแม่น

**SET — ระบุค่าตรง ๆ:**

```json
{ "field": { "fieldCaption": "Region" },
  "filterType": "SET", "values": ["North", "Central"], "exclude": false }
```

**QUANTITATIVE — ช่วงตัวเลข (กับ aggregate ได้ = HAVING):**

```json
{ "field": { "fieldCaption": "Sales", "function": "SUM" },
  "filterType": "QUANTITATIVE_NUMERICAL", "quantitativeFilterType": "MIN",
  "min": 100000 }
```

**DATE — ช่วงเวลาแบบ relative:**

```json
{ "field": { "fieldCaption": "Order Date" },
  "filterType": "QUANTITATIVE_DATE",
  "quantitativeFilterType": "RANGE",
  "minDate": "2026-01-01", "maxDate": "2026-08-31" }
```

**TOP — Top/Bottom N by measure:**

```json
{ "field": { "fieldCaption": "State" },
  "filterType": "TOP",
  "howMany": 5, "direction": "TOP",
  "fieldToMeasure": { "fieldCaption": "Sales", "function": "SUM" } }
```

> ⚠️ รายละเอียด schema (ชื่อ property, enum values) อัปเดตตามเวอร์ชัน — ยึดของจริงจาก [VDS docs ทางการ](https://help.tableau.com/current/api/vizql-data-service/en-us/index.html) เสมอ บทนี้ให้ "แผนที่" ไม่ใช่สเปกสมบูรณ์

## ยิง VDS ตรงด้วย curl (ไม่ผ่าน MCP)

Debug ชั้นล่างสุด — ตัดตัวแปร AI ออกทั้งหมด:

```bash
# 1) Sign in เอา token (ดูบท 2.6)
TOKEN=$(curl -s -X POST "$SERVER/api/3.24/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{"credentials":{"personalAccessTokenName":"'$PAT_NAME'",
       "personalAccessTokenSecret":"'$PAT_SECRET'",
       "site":{"contentUrl":"'$SITE'"}}}' | jq -r '.credentials.token')

# 2) Query
curl -s -X POST "$SERVER/api/v1/vizql-data-service/query-datasource" \
  -H "X-Tableau-Auth: $TOKEN" -H "Content-Type: application/json" \
  -d @query.json | jq
```

## Workflow debug ที่ใช้จริง: "AI ตอบเลขแปลก"

```
1. ถาม AI: "แสดง query ที่ใช้" → ได้ JSON query
2. เอา JSON ไปยิง VDS ตรงด้วย curl → ได้เลขเดียวกับ AI ไหม?
   ├─ ได้เลขเดียวกัน → query ถูก execute ตรง ปัญหาคือ "query ไม่ตรงเจตนา"
   │   → แก้ที่ prompt (บท 4.1) หรือทำ custom tool (บท 5.4)
   └─ ได้เลขต่างกัน → มีอะไรแทรกระหว่างทาง (เวอร์ชัน MCP, credential คนละตัว)
       → เช็ค MCP log + credential ที่แต่ละทางใช้
3. เทียบกับ viz จริงใน Tableau ที่ควรได้เลขเดียวกัน 1 จุด → ปิดเคส
```

## ข้อจำกัดของ VDS ที่ส่งผลถึง MCP

| ข้อจำกัด | ผลที่เห็นตอนใช้ MCP |
|---|---|
| Published DS เท่านั้น | embedded DS ใน workbook → query ไม่ได้ (ย้ำอีกรอบเพราะโดนกันทุกคน) |
| ไม่รองรับ calculated field ระดับ workbook | สูตรใน workbook หายไปจากคำตอบ AI |
| ผลลัพธ์มีเพดานขนาด | คำถามกว้าง ๆ โดนตัด — เป็นเหตุผลของกติกา "ใส่ limit เสมอ" |
| 1 query : 1 data source | งานข้าม DS ต้องหลาย query (กลไกตามบท 4.3) |

---

⬅️ [5.5 REST vs MCP](05-rest-api-vs-mcp.md) | ➡️ [5.7 Agentic Workflows](07-agentic-workflows.md)
