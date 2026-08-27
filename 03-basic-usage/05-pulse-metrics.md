# 3.5 อ่าน Pulse Metrics ผ่าน Claude

> ระดับ: 🟢 Basic | ต้องมี: Tableau Cloud + เปิดใช้ Tableau Pulse + มี metric definition อย่างน้อย 1 ตัว

## ทวนเร็ว ๆ: Pulse คืออะไร

**Tableau Pulse** คือฟีเจอร์ metric-tracking ของ Tableau Cloud — นิยาม metric สำคัญไว้ (เช่น ยอดขายรายวัน) แล้ว Pulse คอยติดตาม สร้าง insight อัตโนมัติ และแจ้งเตือนเมื่อมีความเปลี่ยนแปลงน่าสนใจ โครงสร้างหลัก:

- **Metric Definition** — นิยามแม่ (measure + time dimension + filter ที่อนุญาต)
- **Metric** — ร่างลูกของ definition ตาม filter ที่คน follow (คน follow metric ไม่ใช่ definition)
- **Insights** — คำวิเคราะห์อัตโนมัติ: trend, การเปลี่ยนแปลงผิดปกติ, ตัวขับเคลื่อน

## MCP + Pulse = ผู้ช่วยอ่าน metric ส่วนตัว

สิ่งที่ MCP ทำได้กับ Pulse:

| ความสามารถ | ตัวอย่างคำถาม |
|---|---|
| ดู metric definitions ทั้ง site | "site เรามี Pulse metric อะไรบ้าง" |
| ดู metric ที่ฉัน follow | "ฉัน follow metric อะไรอยู่บ้าง" |
| ดึง **insight bundle** ของ metric | "ขอ insight ล่าสุดของ metric ยอดขายรายวัน" |

**Insight bundle** คือของเด็ดสุด — ประกอบด้วยค่าปัจจุบัน, trend, และ AI-generated insights ที่ Pulse วิเคราะห์ไว้แล้ว เมื่อส่งผ่าน Claude อีกชั้น = ได้ทั้งข้อมูล + คำวิเคราะห์ + การเรียบเรียงตามที่เราสั่ง

## Use Case เด่น: Morning Briefing อัตโนมัติ

Prompt เดียวที่ใช้ได้ทุกเช้า (เก็บไว้ใน Claude Project ยิ่งสะดวก):

```
ดึง insight ของทุก Pulse metric ที่ฉัน follow แล้วสรุปเป็น
morning briefing ภาษาไทย โครงสร้าง:

1. 🔴 ต้องดูด่วน — metric ที่เปลี่ยนแปลงผิดปกติ/แย่ลง
2. 🟢 ข่าวดี — metric ที่ดีขึ้นชัดเจน
3. 😐 ทรงตัว — สรุปรวมสั้น ๆ บรรทัดเดียว

แต่ละข้อใส่ตัวเลข + %เปลี่ยนแปลง ปิดท้ายด้วย
"สิ่งที่ควรถามต่อในที่ประชุมวันนี้" 2 คำถาม
```

ผลลัพธ์คือ briefing ที่พร้อมอ่านก่อนเข้าประชุม 1 นาที — และถ้าอยากให้รันอัตโนมัติทุกเช้าโดยไม่ต้องพิมพ์เอง ทำได้ผ่าน Claude API (ดู Part 5.2)

## Use Case: ถามเจาะจาก Insight

Pulse บอก "ยอดขายตก 8% สัปดาห์นี้" — ใช้ MCP ถามต่อได้ทันทีในแชทเดียว:

```
จาก insight ที่บอกว่ายอดตก 8% ช่วย query data source เบื้องหลัง
ดูหน่อยว่าตกที่ช่องทางไหน (หน้าร้าน/ออนไลน์) และหมวดสินค้าไหนหนักสุด
```

นี่คือจุดที่ MCP เชื่อมสองโลก: **Pulse เห็นสัญญาณ → query-datasource หาสาเหตุ** — workflow ที่ปกติต้องสลับหน้าจอหลายรอบ จบในบทสนทนาเดียว

## Use Case: เปรียบเทียบหลาย Metric

```
เอา metric "ยอดขาย" กับ "จำนวนออเดอร์" มาดูคู่กัน 4 สัปดาห์ล่าสุด
ถ้ายอดขายโตแต่ออเดอร์ไม่โต แปลว่าอะไร วิเคราะห์ให้หน่อย
```

## ถ้าองค์กรยังไม่ได้ใช้ Pulse

หมวดนี้ข้ามไปก่อนได้เลย ไม่กระทบหมวดอื่น — แต่ถ้ามี Tableau Cloud อยู่แล้ว แนะนำให้ลองสร้าง metric definition สัก 2-3 ตัวจาก data source หลัก เพราะ:

1. Pulse ไม่มีค่าใช้จ่ายเพิ่ม (รวมใน Cloud license)
2. เงื่อนไขเดียวที่สำคัญ: ต้องมี **published data source** ที่มี date field — ซึ่งถ้าตามคู่มือนี้มาก็มีอยู่แล้ว
3. Combo "Pulse เฝ้า + MCP วิเคราะห์" คือรูปแบบการใช้ AI กับข้อมูลที่คุ้มที่สุดแบบไม่ต้องเขียนโค้ดเลย

## Troubleshooting เฉพาะ Pulse

| อาการ | สาเหตุที่พบบ่อย |
|---|---|
| ไม่เจอ metric เลย | ยังไม่มี definition ใน site / user ไม่มีสิทธิ์เห็น data source เบื้องหลัง |
| เจอ definition แต่ subscriptions ว่าง | ยังไม่ได้กด follow metric ใน Pulse (คนละอย่างกับการมี definition) |
| Insight bundle error | metric เพิ่งสร้าง ยังไม่มีข้อมูลสะสมพอให้วิเคราะห์ — รอ 2-3 รอบ refresh |

---

⬅️ [3.4 สำรวจ Workbooks](04-explore-workbooks.md) | 🎉 จบ Part 3 — ต่อ [Part 4: Intermediate](../04-intermediate/01-prompt-patterns.md)
