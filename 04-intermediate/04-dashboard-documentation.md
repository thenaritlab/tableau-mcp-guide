# 4.4 สร้าง Documentation ของ Workbook อัตโนมัติ

> ระดับ: 🟡 Intermediate | งานที่ทุกคนรู้ว่าควรทำ แต่ไม่มีใครมีเวลาทำ — จนกระทั่งตอนนี้

## ทำไมบทนี้คุ้มค่ามาก

Documentation ของ dashboard/data source คือสิ่งที่:
- ทุก audit ถามหา
- พนักงานใหม่ทุกคนต้องการ
- คนทำ dashboard ไม่เคยมีเวลาเขียน
- เขียนแล้วก็ตกยุคภายใน 3 เดือน

MCP เปลี่ยนสมการ: AI อ่าน metadata จริง ณ ปัจจุบัน แล้ว generate เอกสารได้ในนาที — และ **rerun ได้ทุกเมื่อ** เอกสารจึงไม่ตกยุค

## Recipe 1: Data Dictionary ของ Data Source

```
สร้าง data dictionary ของ data source "Sales_2026" เป็นตาราง markdown:

| Field | ชนิดข้อมูล | คำอธิบาย | ตัวอย่างค่า | หมายเหตุ |

- คำอธิบาย: ใช้จาก metadata description ถ้ามี ถ้าไม่มีให้เดาจากชื่อ field
  แล้ว **ทำเครื่องหมาย [ต้องตรวจ]** ไว้
- ตัวอย่างค่า: query ค่า distinct มา 3 ค่าแรก (เฉพาะ dimension)
- หมายเหตุ: ระบุ field ที่มี null เกิน 10%
```

จุดที่ออกแบบไว้ในตัว prompt:
- **[ต้องตรวจ]** แยกชัดว่าอันไหน AI เดา — คนตรวจเฉพาะจุดนั้นพอ ไม่ต้องไล่ทั้งเอกสาร
- ดึงตัวอย่างค่าจริง ทำให้เอกสารใช้งานได้จริงกว่า description ลอย ๆ

## Recipe 2: เอกสารอธิบาย Dashboard (สำหรับ end user)

```
ทำคู่มือผู้ใช้สำหรับ workbook "Executive Dashboard":

1. ดู views ทั้งหมดใน workbook + ดึงภาพแต่ละ view
2. ต่อ view เขียน:
   - หน้านี้ตอบคำถามธุรกิจอะไร (1 ประโยค)
   - chart แต่ละตัวอ่านอย่างไร
   - filter ที่ใช้ได้ และข้อควรระวังในการตีความ
3. ปิดท้าย FAQ 5 ข้อที่ user มือใหม่น่าจะถาม

เขียนภาษาไทย ระดับคนไม่เคยใช้ Tableau อ่านรู้เรื่อง
```

## Recipe 3: Inventory Report สำหรับ Admin

```
ทำ inventory ของ project "Sales":
- workbook ทั้งหมด: ชื่อ | owner | แก้ล่าสุด | views ใน 90 วัน
- เรียงตาม views น้อย → มาก
- ตัวไหนไม่มีคนดูเลย 90 วัน + ไม่ได้แก้เกิน 6 เดือน ให้ขึ้นสถานะ
  "候เลิกใช้ (candidate for archive)"
```

ใช้ก่อนทำ site cleanup — จากงานขุดข้อมูลครึ่งวันเหลือ 5 นาที

## Recipe 4: Change Log เปรียบเทียบ

รัน Recipe 1 ทุกเดือนแล้วเก็บผลไว้ (เช่นใน git) จากนั้น:

```
เทียบ data dictionary เดือนนี้กับฉบับเดือนก่อน (แนบให้)
มี field เพิ่ม/หาย/เปลี่ยนชนิดไหม สรุปเป็น change log
```

จับ schema drift ได้ก่อนที่ dashboard จะพังแบบเงียบ ๆ

## Workflow แนะนำ: เก็บผลลง Git

เอกสารที่ generate แล้ว ให้เก็บเข้า repo (เช่นโฟลเดอร์ `docs/` ของทีม):

```
docs/
├── data-dictionary/
│   ├── sales-2026_2026-08.md
│   └── sales-2026_2026-07.md
└── dashboards/
    └── executive-dashboard-guide.md
```

ได้ version history ฟรี + diff ระหว่างเดือนดูได้จาก git เลย

## ข้อจำกัดที่ต้องบอกทีม

1. **AI เดา description จากชื่อ field ได้ผิด** — ระบบ [ต้องตรวจ] ใน Recipe 1 คือกลไกกันพลาด อย่าตัดออก
2. **เอกสารดีแค่ไหนขึ้นกับ metadata ต้นทาง** — ถ้าใส่ description ที่ data source ไว้ดี ผลจะดีมาก นี่เป็นแรงจูงใจให้ทีมกลับไปเติม description (วนเป็น cycle ที่ดี)
3. **ภาพ view เป็น snapshot** — เอกสารควรระบุวันที่ generate เสมอ (ใส่ในคำสั่งได้: "ใส่วันที่จัดทำท้ายเอกสาร")

---

⬅️ [4.3 Multi Data Source](03-multi-datasource.md) | ➡️ [4.5 Claude Projects Workflow](05-claude-projects-workflow.md)
