# 5.4 Fork แล้วเพิ่ม Tool เอง (TypeScript)

> ระดับ: 🔴 Advanced | ต้องผ่าน: บท 2.4 (local build) + 5.1 (protocol)

เมื่อไหร่ต้องเขียน tool เอง? เมื่องานที่ทำซ้ำบ่อยต้องเรียกหลาย tool ต่อกันเป็นชุดตายตัว หรือต้องการ logic เฉพาะองค์กร (เช่น "query ยอดขายตามนิยาม fiscal ของเรา") — ยัดเป็น tool เดียวให้ AI เรียกทีเดียวจบ แม่นกว่าและถูกกว่า (token น้อยลง)

## Setup

```bash
# fork tableau/tableau-mcp บน GitHub ก่อน แล้ว:
git clone https://github.com/thenaritlab/tableau-mcp.git
cd tableau-mcp
git remote add upstream https://github.com/tableau/tableau-mcp.git   # ไว้ sync ของใหม่
npm install && npm run build
```

## กายวิภาคของ tool ใน repo

เปิด `src/tools/` — แต่ละ tool คือไฟล์ที่ประกอบด้วย 3 ส่วน:

```typescript
// โครงร่วมของทุก tool (ชื่อ type/helper จริงดูจากเวอร์ชันที่คุณ clone)
export const myTool = {
  name: "my-tool-name",                    // 1) ชื่อ — kebab-case
  description: "...",                      // 2) คำอธิบาย — สำคัญที่สุด!
  paramsSchema: z.object({ ... }),         // 3) Zod schema ของ arguments
  callback: async (args) => { ... },       // 4) logic จริง
};
```

**อ่านของจริง 2-3 ตัวก่อนเขียนเอง** — แนะนำเริ่มจาก tool ที่เรียบง่ายอย่าง list-datasources แล้วค่อยดู query-datasource — สไตล์การเขียน, error handling, และ helper ที่มีให้ใช้ จะชัดกว่าคำอธิบายใด ๆ

## ตัวอย่าง: tool "sales-summary" เฉพาะองค์กร

โจทย์: ผู้ใช้ถามสรุปยอดขายบ่อยมาก และนิยาม "ยอดขาย" ขององค์กรตายตัว (Net Sales, fiscal month) — แทนที่จะหวังให้ AI ประกอบ query ถูกทุกครั้ง ทำ tool เฉพาะ:

```typescript
// src/tools/salesSummary.ts (โครงแนวคิด — ปรับตามโครงจริงของเวอร์ชันที่ clone)
import { z } from "zod";

export const salesSummaryTool = {
  name: "sales-summary",
  description:
    "สรุปยอดขาย (Net Sales ตามนิยาม fiscal ของบริษัท) ตามช่วงเวลาและมิติที่เลือก " +
    "ใช้ tool นี้เสมอเมื่อผู้ใช้ถามภาพรวมยอดขาย แทนการประกอบ query เอง " +
    "รองรับมิติ: region, channel, category",
  paramsSchema: z.object({
    fiscalMonth: z.string().describe("เดือน fiscal รูปแบบ YYYY-MM"),
    groupBy: z.enum(["region", "channel", "category"]),
  }),
  callback: async ({ fiscalMonth, groupBy }) => {
    // แปลง fiscal month → ช่วงวันที่จริง (นิยามองค์กร: เริ่มวันที่ 25)
    const { startDate, endDate } = fiscalToDateRange(fiscalMonth);

    // ประกอบ VDS query ที่ "ถูกต้องตามนิยาม" เสมอ — จุดขายของ tool นี้
    const query = {
      fields: [
        { fieldCaption: FIELD_MAP[groupBy] },
        { fieldCaption: "Net Sales", function: "SUM" },
      ],
      filters: [dateRangeFilter("Order Date", startDate, endDate)],
    };

    const result = await vdsQuery(SALES_DATASOURCE_LUID, query); // helper จาก src/sdks
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  },
};
```

แล้วลงทะเบียนใน array ของ tools (ดูไฟล์รวม tools ใน src) → `npm run build`

## ศิลปะการเขียน description (ตัวตัดสินความสำเร็จ)

LLM เลือก tool จาก description ล้วน ๆ — เขียนให้ครอบคลุม 3 คำถาม:

1. **ทำอะไร** — ตรงไปตรงมา
2. **เมื่อไหร่ควรใช้** — "ใช้ tool นี้เสมอเมื่อ..." ช่วยแย่งงานจาก tool ทั่วไปอย่าง query-datasource
3. **ข้อจำกัด** — มิติที่รองรับ, รูปแบบ input

ทดสอบง่าย ๆ: ให้เพื่อนอ่านเฉพาะ description แล้วเดาว่า tool นี้ใช้ตอบคำถามไหนได้บ้าง — ถ้าคนเดาถูก AI ก็เลือกถูก

## ทดสอบ

```bash
npm run inspect      # เรียก sales-summary ตรง ๆ ใน Inspector ก่อน
```

ผ่านแล้วชี้ Claude Desktop มาที่ build ของ fork (config แบบบท 2.4) → ทดสอบด้วยคำถามจริง เช็คว่า AI **เลือก** tool ใหม่เองเมื่อควรเลือก — ถ้าไม่เลือก = แก้ description ไม่ใช่แก้โค้ด

**อย่าลืมกฎเหล็กจากบท 5.1:** debug ด้วย `console.error` เท่านั้น — `console.log` จะพัง stdio transport

## ดูแล fork ระยะยาว

```bash
# ดึงของใหม่จาก Tableau เข้ามารวมเป็นระยะ
git fetch upstream
git merge upstream/main    # แก้ conflict ถ้า tool structure เปลี่ยน
npm run build
```

แนวปฏิบัติที่ช่วยให้ merge ง่าย: **แยกโค้ดของคุณเป็นไฟล์ใหม่เสมอ** แตะไฟล์เดิมให้น้อยที่สุด (แค่จุดลงทะเบียน tool) — upstream เปลี่ยนแรงแค่ไหน conflict ก็จำกัดวง

> 💡 tool ที่มีประโยชน์ต่อคนทั่วไป (ไม่ผูกนิยามภายใน) พิจารณาเปิด PR กลับ upstream — repo ทางการรับ contribution และชื่อคุณจะอยู่ใน contributors ของ Tableau 😉

---

⬅️ [5.3 Chat Web App](03-build-chat-webapp.md) | ➡️ [5.5 REST API vs MCP](05-rest-api-vs-mcp.md)
