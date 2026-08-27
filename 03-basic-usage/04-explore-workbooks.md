# 3.4 ค้นหาและสำรวจ Workbook / View

> ระดับ: 🟢 Basic

หมวดนี้ตอบโจทย์คนละแบบกับ query — ไม่ใช่ "ถามตัวเลข" แต่คือ **"หาของ + เข้าใจของที่มีอยู่"** ซึ่งเป็นปัญหาจริงของทุก site ที่ workbook เกินร้อยตัว

## ค้นหา Content

### หาแบบรู้ชื่อคร่าว ๆ

```
หา workbook ที่เกี่ยวกับ marketing funnel
```

### หาแบบรู้เงื่อนไข

```
workbook ทั้งหมดใน project "Sales" ที่แก้ไขล่าสุดภายใน 30 วัน
ใครเป็น owner บ้าง
```

### หาตามการใช้งาน

```
workbook ไหนถูกเปิดดูมากที่สุดในปีนี้ 10 อันดับแรก
```

use case ตรงข้ามก็มีประโยชน์กับงาน admin มาก:

```
workbook ไหนไม่มีคนเปิดดูเลยใน 6 เดือน — ทำรายชื่อเพื่อพิจารณา archive
```

## สำรวจโครงสร้าง Workbook

```
workbook "Executive Dashboard" มี view อะไรบ้าง แต่ละหน้าแสดงอะไร
```

ต่อด้วยขอดูของจริง:

```
ขอดูภาพ view "Monthly Overview" หน่อย
```

Claude ดึงภาพมาแสดงในแชทเลย — จากตรงนี้ต่อยอดได้หลายทาง:

### Use case: อธิบาย dashboard ให้คนใหม่

```
จากภาพ view นี้ ช่วยอธิบายว่าแต่ละ chart บอกอะไร
เขียนแบบให้พนักงานใหม่ที่ไม่เคยเห็น dashboard นี้อ่านเข้าใจ
```

### Use case: รีวิว design

```
วิจารณ์ dashboard นี้ตามหลัก data visualization
มีจุดไหนควรปรับปรุงบ้าง (สี, layout, chart type, ความหนาแน่น)
```

### Use case: ดึงข้อมูลเบื้องหลัง view

```
ขอข้อมูลของ view "Top Customers" เป็นตาราง
```

> 💡 **view data vs query-datasource ต่างกันอย่างไร?**
> - **view data** = ได้ข้อมูล "ตามที่ view นั้นจัดไว้แล้ว" (filter/คำนวณของ view ติดมาด้วย) — เหมาะเมื่ออยากได้เลขตรงกับที่คนเห็นบน dashboard เป๊ะ ๆ
> - **query-datasource** = query อิสระจาก data source ตรง ๆ — เหมาะกับคำถามใหม่ที่ dashboard ไม่ได้ทำไว้
> ถ้าตัวเลขสองทางนี้ไม่ตรงกัน 90% คือ view มี filter ซ่อนอยู่

## Workflow จริง: จากหาของ → วิเคราะห์ (ร้อยหลาย tool ในคำสั่งเดียว)

พลังจริงคือการที่ Claude ต่อ tool หลายตัวเองอัตโนมัติ:

```
หา workbook ที่เกี่ยวกับยอดขายรายไตรมาส แล้วดูว่า view หลักใช้
data source ตัวไหน จากนั้น query data source นั้นเทียบ Q2 กับ Q3
สรุปมาเป็น bullet 5 ข้อ
```

เบื้องหลัง: search → get workbook → list views → (หา data source) → query-datasource → สรุป — ทั้งหมดจากคำสั่งเดียว

## ข้อจำกัดของหมวดนี้

- **อ่านอย่างเดียว** — เปลี่ยนชื่อ ย้าย project ลบ workbook ผ่าน MCP ไม่ได้ (ดีแล้ว!)
- ภาพ view ที่ดึงมาเป็น snapshot ณ ตอนเรียก ไม่ interactive
- View ที่ต้อง login เพิ่ม (embedded credentials หมดอายุ) อาจดึงภาพ/ข้อมูลไม่ได้ — แก้ที่ตัว workbook ใน Tableau

---

⬅️ [3.3 Query Data Source](03-query-datasource.md) | ➡️ [3.5 Pulse Metrics](05-pulse-metrics.md)
