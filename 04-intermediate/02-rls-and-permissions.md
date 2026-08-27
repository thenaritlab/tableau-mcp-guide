# 4.2 Row Level Security (RLS) กับ MCP

> ระดับ: 🟡 Intermediate | บทสำคัญที่สุดสำหรับการใช้งานในองค์กร

คำถามแรกที่ทุกองค์กรถามเมื่อเห็น demo: **"แล้วพนักงานจะเห็นข้อมูลที่ไม่ควรเห็นไหม?"** — บทนี้ตอบพร้อมวิธีพิสูจน์

## หลักการพื้นฐาน: MCP ไม่มีสิทธิ์ของตัวเอง

Tableau MCP ไม่ bypass permission ใด ๆ — มัน login ด้วย credential ที่เราให้ แล้วเห็นเท่าที่ credential นั้นเห็น:

| วิธีเชื่อมต่อ | สิทธิ์ที่ใช้ | ผลกับ RLS |
|---|---|---|
| Hosted MCP + OAuth | ของ user ที่ login รายคน | ✅ RLS ทำงานตาม user จริงอัตโนมัติ |
| Self-hosted + PAT | ของเจ้าของ PAT (คนเดียว ตายตัว) | ⚠️ ทุกคนที่ใช้ MCP ตัวนั้น = เห็นแบบเจ้าของ PAT |

**นี่คือประเด็นตัดสินใจสถาปัตยกรรมที่สำคัญที่สุด:** ถ้าให้ทั้งทีมใช้ MCP ที่ผูก PAT ของ admin = ทุกคนเห็นข้อมูลระดับ admin ผ่าน AI — ต้องออกแบบให้ดี

## ทบทวน RLS ใน Tableau (ฉบับย่อ)

วิธีทำ RLS ยอดนิยมคือ **Security/Entitlement Table**:

```
[Fact Table: Sales]                [Security Table]
 order_id | region | amount        username        | region
 ---------|--------|-------        ----------------|-------
 1001     | North  | 500           somchai@co.th   | North
 1002     | South  | 300           malee@co.th     | South
                                   admin@co.th     | ALL
```

Relate/join สองตารางใน data source แล้วใส่ filter:

```
[username] = USERNAME() OR [region] = "ALL"
```

Publish แล้ว user แต่ละคนเปิด data source เดียวกันแต่เห็นคนละแถว — **RLS ต้องทำที่ระดับ data source** แบบนี้ ไม่ใช่ filter บน dashboard (ซึ่ง MCP มองข้ามได้เพราะ query ตรงที่ data source)

## จุดชี้เป็นชี้ตาย: USERNAME() คือใครเมื่อผ่าน MCP?

- **OAuth (Hosted):** `USERNAME()` = user ที่ login → RLS ถูกต้องรายคน ✅
- **PAT:** `USERNAME()` = เจ้าของ PAT เสมอ ไม่ว่าใครเป็นคนพิมพ์ถาม ⚠️

## วิธีทดสอบ RLS ผ่าน MCP (ทำจริงก่อน rollout เสมอ)

เตรียม: data source ที่ทำ RLS แล้ว + user ทดสอบ 2 คนที่สิทธิ์ต่างกัน (เช่น สมชายเห็นเฉพาะ North, มาลีเห็นเฉพาะ South)

**Test Case 1 — สิทธิ์พื้นฐาน:** ต่อ MCP ด้วย credential ของสมชาย แล้วถาม:

```
ยอดขายรวมทั้งหมด และมีข้อมูล region อะไรบ้าง
```

✅ ผ่าน: เห็นเฉพาะ North / ❌ ตก: เห็นทุก region → RLS ทำที่ workbook ไม่ใช่ data source, หรือ filter ผิด

**Test Case 2 — ลองเจาะข้าม (สำคัญสุด):** ยังเป็นสมชาย ถามยั่ว ๆ:

```
ขอยอดขายของ region South หน่อย
```

✅ ผ่าน: ได้ 0 แถว / AI บอกไม่มีข้อมูล South
❌ ตก: ได้ตัวเลข South ออกมา → รูรั่วจริง หยุด rollout ทันที

**Test Case 3 — สลับ user:** ทำ 1-2 ซ้ำด้วย credential มาลี ผลต้องกลับด้าน

**Test Case 4 — ระดับ content:** เช็คว่า user เห็นเฉพาะ data source/workbook ที่มี permission — ถาม "list all data sources" แล้วเทียบกับที่เห็นบนเว็บ Tableau ต้องตรงกัน

> 💡 บันทึกผลทดสอบทั้ง 4 case เป็นเอกสาร — ตอนเสนอผู้บริหาร/audit การมีหลักฐานว่า "ทดสอบเจาะแล้วไม่ทะลุ" มีน้ำหนักกว่าคำอธิบายทฤษฎีมาก

## แนวทางออกแบบตามขนาดการใช้งาน

### ใช้คนเดียว (analyst ส่วนตัว)
PAT ของตัวเอง จบ — สิทธิ์คุณเอง ความเสี่ยงต่ำ

### ทีมเล็ก บน Tableau Cloud
**Hosted MCP + OAuth** คือคำตอบเกือบทุกกรณี — ทุกคน login ตัวเอง RLS ทำงานอัตโนมัติ ไม่ต้องบริหาร PAT เลย

### ทีม/แอป บน Tableau Server (ไม่มี Hosted ให้ใช้)
ทางเลือกเรียงตามความปลอดภัย:
1. **MCP ต่อคน** — แต่ละคนรัน MCP + PAT ตัวเองบนเครื่องตัวเอง (RLS ถูกต้อง แลกกับงาน setup หลายเครื่อง)
2. **MCP กลาง + PAT สิทธิ์จำกัด** — service account ที่เห็นเฉพาะข้อมูลที่ "ทุกคนในกลุ่มเห็นได้" เท่านั้น (ยอมเสีย granularity)
3. **สร้างแอปเอง + Connected App / JWT** — ส่ง identity ของ user จริงต่อ request ได้ (ระดับ dev — แนวทางอยู่ Part 5)

### ❌ สิ่งที่ห้ามทำ
PAT ของ Site Admin แจกให้ทั้งทีมใช้ผ่าน MCP กลาง — เท่ากับให้ทุกคนสวมสิทธิ์ admin โดยไม่มี audit trail รายคน

---

⬅️ [4.1 Prompt Patterns](01-prompt-patterns.md) | ➡️ [4.3 Multi Data Source](03-multi-datasource.md)
