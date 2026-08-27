# 5.2 เรียก Tableau MCP ผ่าน Anthropic API

> ระดับ: 🔴 Advanced | ต้องมี: Anthropic API key, MCP server แบบ HTTP (บท 2.5)

จุดเปลี่ยนสำคัญ: จาก "คุยกับข้อมูลผ่านแอป Claude" → **"เขียนโปรแกรมที่คุยกับข้อมูลได้"** — ปลดล็อก automation, scheduled reports, และแอปของตัวเอง

## แนวคิด: MCP Connector ใน Messages API

Anthropic Messages API รองรับพารามิเตอร์ `mcp_servers` — บอก URL ของ MCP server ไป แล้ว **ฝั่ง Anthropic จัดการ loop การเรียก tool ให้ทั้งหมด**: Claude ตัดสินใจเรียก tool → ระบบยิงไปที่ MCP server ของเรา → เอาผลกลับไปให้ Claude คิดต่อ → วนจนได้คำตอบ — เราส่ง 1 request ได้คำตอบสุดท้ายเลย

```
[โค้ดเรา] ──1 request──► [Anthropic API + Claude]
                              │  ▲   (วนเรียก tool กี่รอบก็ได้)
                              ▼  │
                        [Tableau MCP (HTTP)] ──► [Tableau]
```

**เงื่อนไขสำคัญ:** MCP server ต้องเป็นแบบ **HTTP ที่ Anthropic เข้าถึงได้จากอินเทอร์เน็ต** — stdio บนเครื่องเราใช้กับวิธีนี้ไม่ได้ (ทางเลือก: Hosted mcp.tableau.com ก็เป็น HTTP endpoint อยู่แล้ว แต่ต้องจัดการ OAuth token)

> ⚠️ ฟีเจอร์ MCP connector ยังพัฒนาเร็ว รายละเอียด (beta header, พารามิเตอร์) อาจเปลี่ยน — เช็คของจริงที่ [docs.claude.com](https://docs.claude.com) ประกอบเสมอ

## ตัวอย่าง: Node.js

```javascript
// npm install @anthropic-ai/sdk
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const response = await client.beta.messages.create(
  {
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    messages: [{
      role: "user",
      content: "Top 5 จังหวัดยอดขายสูงสุดปีนี้จาก data source Superstore สรุปเป็นภาษาไทย"
    }],
    mcp_servers: [{
      type: "url",
      url: "https://mcp.your-company.com/mcp",   // MCP server ของเรา (บท 2.5 + 6.1)
      name: "tableau",
      authorization_token: process.env.MCP_AUTH_TOKEN  // ถ้า server มี auth ชั้นหน้า
    }]
  },
  { headers: { "anthropic-beta": "mcp-client-2025-04-07" } }
);

// content มีหลาย block: text / mcp_tool_use / mcp_tool_result
const answer = response.content
  .filter(b => b.type === "text")
  .map(b => b.text)
  .join("\n");

console.log(answer);
```

## ตัวอย่าง: Python

```python
# pip install anthropic
import os
import anthropic

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

response = client.beta.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=2000,
    messages=[{
        "role": "user",
        "content": "สรุปยอดขายรายเดือนปี 2026 จาก data source Superstore"
    }],
    mcp_servers=[{
        "type": "url",
        "url": "https://mcp.your-company.com/mcp",
        "name": "tableau",
    }],
    extra_headers={"anthropic-beta": "mcp-client-2025-04-07"},
)

answer = "".join(b.text for b in response.content if b.type == "text")
print(answer)
```

## อ่านผลลัพธ์ให้เป็น: content blocks

response ไม่ได้มีแค่ข้อความ — มี 3 ชนิด block ปนกัน:

| type | คืออะไร | ใช้ทำอะไร |
|---|---|---|
| `text` | คำตอบภาษาคนของ Claude | แสดงให้ user |
| `mcp_tool_use` | Claude เรียก tool อะไร ด้วย argument อะไร | **audit log ชั้นดี** — เก็บไว้เสมอ |
| `mcp_tool_result` | ข้อมูลดิบที่ tool ตอบกลับ | debug / ตรวจเลข |

```javascript
// เก็บ audit ว่า AI query อะไรบ้าง
const audit = response.content
  .filter(b => b.type === "mcp_tool_use")
  .map(b => ({ tool: b.name, args: b.input }));
```

## Use Case สำเร็จรูป: Weekly Report เข้า LINE/อีเมล

โครง script ที่รันด้วย cron ทุกเย็นศุกร์ (โค้ดเต็มอยู่ [examples/api-scripts](../examples/api-scripts/)):

```
1. เรียก Messages API + mcp_servers ด้วย prompt รายงานประจำสัปดาห์
   (ใช้ prompt template จากบท 4.1 ได้เลย)
2. ได้สรุปภาษาไทยกลับมา
3. ส่งต่อผ่าน LINE Messaging API / SMTP
4. เก็บ mcp_tool_use blocks ลง log
```

ต้นทุนต่อรายงานหลัก ๆ คือ token ของ query + คำตอบ — งานสรุปทั่วไปตกหลักไม่กี่บาทต่อครั้ง

## ทางเลือก: จัดการ loop เอง (ไม่ใช้ MCP connector)

อีกสถาปัตยกรรมคือใช้ `tools` ปกติของ Messages API แล้วโค้ดเราเป็นคนกลาง: รับ tool_use → เรียก MCP server เอง (หรือยิง REST/VDS ตรง) → ส่ง tool_result กลับ → วน loop เอง

| | MCP connector (`mcp_servers`) | จัดการ loop เอง |
|---|---|---|
| ความง่าย | ✅ ง่ายมาก 1 request จบ | ต้องเขียน loop เอง |
| ควบคุม/กรองผล tool ก่อนส่งให้ AI | จำกัด | ✅ เต็มที่ (censor, cache, limit ได้) |
| MCP server ต้อง public | ต้องเข้าถึงจากภายนอกได้ | ❌ ไม่ต้อง — อยู่ใน network ภายในได้ |

องค์กรที่ห้ามเปิด MCP ออก internet มักจบที่แบบหลัง — ซึ่งจะใช้ในบท 5.3 ด้วยเหตุผลนี้แหละ

---

⬅️ [5.1 MCP Protocol](01-mcp-protocol-basics.md) | ➡️ [5.3 สร้าง Chat Web App](03-build-chat-webapp.md)
