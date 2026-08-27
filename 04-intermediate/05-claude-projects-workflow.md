# 4.5 ผูก MCP กับ Claude Projects สำหรับงานประจำ

> ระดับ: 🟡 Intermediate | ต้องมี: Claude paid plan (Projects)

## ปัญหาของการใช้แชทเปล่า ๆ

Pattern จากบท 4.1 (context priming, glossary, output template) ใช้ได้ดี — แต่ต้อง **พิมพ์ใหม่ทุกแชท** และเพื่อนร่วมทีมไม่ได้ประโยชน์ด้วย

**Claude Projects** แก้ตรงนี้: สร้าง "ห้องทำงาน" ที่ฝัง instructions + เอกสารความรู้ไว้ถาวร ทุกแชทในห้องเริ่มต้นด้วย context ครบทันที

## โครงสร้าง Project แนะนำสำหรับงาน Tableau

### 1. Project Instructions (หัวใจสำคัญ)

ตัวอย่างที่ปรับใช้ได้เลย:

```
คุณคือ data analyst assistant ของทีม [ชื่อทีม]

ข้อมูลหลัก:
- Data source หลัก: "Sales_2026" — ใช้ตัวนี้เว้นแต่สั่งเป็นอื่น
- "ยอดขาย" = [Net Sales], "กำไร" = [Gross Profit]
- ปีงบประมาณเริ่ม 1 ต.ค. / "ปีนี้" = FY2026
- ลูกค้าหลัก 3 กลุ่ม: Enterprise, SME, Retail

กติกาการตอบ:
- ภาษาไทย ตัวเลขใส่ comma ทศนิยม 2 ตำแหน่ง
- ทุกคำตอบตัวเลขต้องแนบ query ที่ใช้ (field + filter)
- limit ทุก query ไม่เกิน 200 แถว
- ไม่แน่ใจว่า field ไหน → ถามก่อน ห้ามเดา
```

### 2. Project Knowledge (ไฟล์แนบ)

อัปโหลดไฟล์ที่ช่วยให้ AI ฉลาดขึ้นกับบริบทของคุณ:

| ไฟล์ | ได้จากไหน |
|---|---|
| `data-dictionary.md` | Generate จากบท 4.4 แล้วตรวจแล้ว |
| `business-glossary.md` | ศัพท์ภายใน ↔ ชื่อ field จริง |
| `report-templates.md` | โครงรายงานประจำที่ทีมใช้ |
| `known-issues.md` | ข้อมูลช่วงไหนมีปัญหา ("ข้อมูล มี.ค. ไม่ครบ อย่าใช้เทียบ") |

> 💡 `known-issues.md` คือไฟล์ที่คนมองข้ามแต่คุ้มสุด — กัน AI เอาข้อมูลช่วงที่มีปัญหามาสรุปแบบมั่นใจ

## Project แยกตามงาน (อย่ายัดทุกอย่างห้องเดียว)

ตัวอย่างการแบ่งที่ใช้ได้จริง:

- **📊 Weekly Sales Review** — instructions เน้น template รายงานสัปดาห์ → เปิดแชทใหม่ พิมพ์แค่ "ทำรายงานสัปดาห์นี้" จบ
- **🔍 Ad-hoc Analysis** — instructions หลวมกว่า เน้น chain-of-analysis สำหรับคำถามเปิด
- **📝 Documentation Factory** — ฝัง recipes จากบท 4.4 ไว้ทั้งหมด
- **🏥 Data Quality Watch** — เน้นตรวจ null, reconciliation, schema change

## Workflow ประจำสัปดาห์ตัวอย่าง (ทีมขาย)

```
จันทร์เช้า   → Project "Weekly Sales Review" : "ทำรายงานสัปดาห์ที่แล้ว"
             (template ใน knowledge ทำให้ได้รายงานหน้าตาเดิมทุกสัปดาห์)
ระหว่างสัปดาห์ → Project "Ad-hoc" : คำถามจากผู้บริหาร/ทีม
ศุกร์        → Project "Data Quality Watch" : "ตรวจความพร้อมข้อมูลก่อนปิดสัปดาห์"
สิ้นเดือน    → Project "Documentation Factory" : rerun data dictionary + change log
```

## ข้อจำกัดที่ควรรู้

1. **MCP connector ผูกระดับบัญชี ไม่ใช่ระดับ Project** — ทุกคนในทีมต้องต่อ MCP ของตัวเอง (Hosted MCP ทำข้อนี้ง่ายสุด: แค่ login) ส่วน Project แชร์ instructions + knowledge ให้
2. **Knowledge ไม่ refresh เอง** — data dictionary ในห้องคือฉบับที่อัปโหลด ตั้งรอบอัปเดต (เช่นเดือนละครั้ง พร้อม Recipe 4 ของบท 4.4)
3. **อย่าใส่ secret ใน instructions** — ไม่ต้องใส่ PAT หรือ credential ใด ๆ ทั้งสิ้น (MCP จัดการ auth อยู่แล้ว)

## เช็คว่า setup ดีหรือยัง: "The New Member Test"

ให้คนที่เพิ่งเข้าทีมเปิด Project แล้วถามคำถามงานจริง 3 ข้อโดยไม่ต้องสอนอะไรเพิ่ม — ถ้าได้คำตอบถูกต้องในรูปแบบที่ทีมใช้ = Project ของคุณ encode ความรู้ทีมสำเร็จแล้ว และนั่นแหละคือมูลค่าจริงของบทนี้: **ความรู้ที่เคยอยู่ในหัวคนเก่า ตอนนี้อยู่ในระบบ**

---

⬅️ [4.4 Auto Documentation](04-dashboard-documentation.md) | 🎉 จบ Part 4 → [Part 5: Advanced Programming](../05-advanced-programming/01-mcp-protocol-basics.md)
