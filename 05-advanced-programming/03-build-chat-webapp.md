# 5.3 สร้าง Web App Chat กับ Tableau (Node.js)

> ระดับ: 🔴 Advanced | ผลลัพธ์: "Chat with your data" app ที่พนักงานใช้ผ่าน browser

## สถาปัตยกรรม

เราใช้แบบ "จัดการ loop เอง" จากท้ายบท 5.2 — เพราะ MCP server อยู่ใน network ภายในได้ ไม่ต้องเปิดออก internet:

```
[Browser] ──► [Node.js Backend] ──► Anthropic API (tools + loop)
                    │
                    └──► Tableau MCP (HTTP, internal) ──► Tableau
```

Backend ทำ 3 หน้าที่: (1) เก็บ API key ไม่ให้หลุดไป browser (2) เดิน tool loop (3) บังคับกติกา (limit, logging, สิทธิ์)

> 🚨 **ห้ามเรียก Anthropic API จาก browser ตรง ๆ เด็ดขาด** — API key จะอยู่ใน JavaScript ที่ใครก็เปิดดูได้

## โครงโปรเจกต์ (โค้ดเต็มรันได้อยู่ที่ [examples/webapp-demo](../examples/webapp-demo/))

```
webapp-demo/
├── server.js          # Express + tool loop
├── mcp-client.js      # ตัวคุยกับ Tableau MCP
├── public/index.html  # หน้าแชท
├── .env.example
└── package.json
```

## หัวใจที่ 1: MCP client ฝั่ง backend

ใช้ official SDK ต่อเข้า Tableau MCP แบบ Streamable HTTP:

```javascript
// mcp-client.js — npm install @modelcontextprotocol/sdk
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

export async function connectMcp() {
  const client = new Client({ name: "tableau-chat-app", version: "1.0.0" });
  const transport = new StreamableHTTPClientTransport(
    new URL(process.env.TABLEAU_MCP_URL)   // เช่น http://tableau-mcp.internal:3927/mcp
  );
  await client.connect(transport);
  return client;
}

export async function getToolsForClaude(mcp) {
  const { tools } = await mcp.listTools();
  // แปลง schema MCP → รูปแบบ tools ของ Anthropic API
  return tools.map(t => ({
    name: t.name,
    description: t.description,
    input_schema: t.inputSchema,
  }));
}
```

## หัวใจที่ 2: Tool loop

```javascript
// ส่วนสำคัญของ server.js
import Anthropic from "@anthropic-ai/sdk";
const anthropic = new Anthropic();

async function chat(mcp, tools, messages) {
  for (let round = 0; round < 10; round++) {          // กัน loop ไม่รู้จบ
    const res = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,          // กติกาจากบท 4.1 ฝังตรงนี้
      messages, tools,
    });

    if (res.stop_reason !== "tool_use") {
      return res.content.filter(b => b.type === "text").map(b => b.text).join("\n");
    }

    // Claude ขอเรียก tool → เราไปเรียก MCP ให้ แล้วส่งผลกลับ
    messages.push({ role: "assistant", content: res.content });
    const results = [];
    for (const block of res.content.filter(b => b.type === "tool_use")) {
      console.error("AUDIT:", block.name, JSON.stringify(block.input)); // log ทุก call
      const out = await mcp.callTool({ name: block.name, arguments: block.input });
      results.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(out.content).slice(0, 50_000),  // จำกัดขนาดกัน token บาน
      });
    }
    messages.push({ role: "user", content: results });
  }
  return "ขออภัย งานนี้ซับซ้อนเกินรอบที่กำหนด กรุณาแตกคำถามให้เล็กลง";
}
```

สังเกต 3 จุดที่เป็น "กติกา" ของเรา ไม่ใช่ของ AI:
1. **จำกัดรอบ loop** (10) — กันคำถามที่ทำให้ AI วนไม่จบ
2. **AUDIT log ทุก tool call** — ใครถาม อะไรถูก query — ของสำคัญที่สุดตอนองค์กรตรวจ
3. **ตัดขนาด tool result** — query ใหญ่จะไม่ลาก token cost บานปลาย

## หัวใจที่ 3: System prompt ของแอป

ความรู้จาก Part 4 ทั้งหมดมาลงที่นี่:

```javascript
const SYSTEM_PROMPT = `
คุณคือผู้ช่วยวิเคราะห์ข้อมูลของบริษัท ตอบภาษาไทย
- ใช้ list-fields ก่อน query data source ที่ยังไม่เคยดูในบทสนทนานี้
- ทุก query ใส่ limit ≤ 100 แถว
- ตอบตัวเลขพร้อมระบุ field และ filter ที่ใช้เสมอ
- ไม่แน่ใจความหมาย field → ถาม user ห้ามเดา
`;
```

## รันและทดสอบ

```bash
cd examples/webapp-demo
cp .env.example .env        # ใส่ ANTHROPIC_API_KEY + TABLEAU_MCP_URL
npm install
node server.js
# เปิด http://localhost:3000
```

## จาก demo → production: สิ่งที่ต้องเพิ่ม

| เรื่อง | ขั้นต่ำที่ต้องทำ |
|---|---|
| ยืนยันตัวตนผู้ใช้ | SSO ขององค์กร (มีผลต่อ RLS — ดูข้อถัดไป) |
| RLS รายคน | PAT เดียว = ทุกคนเห็นเท่ากัน ต้องออกแบบ (บท 4.2 ทางเลือก 1-3) |
| Rate limit | จำกัดคำถาม/คน/ชั่วโมง กัน cost บาน |
| ประวัติแชท | เก็บ per-user ลง DB (demo เก็บใน memory) |
| Deploy | อยู่หลัง reverse proxy + TLS ใน network ภายใน (Part 6.1) |

> 💡 **คำแนะนำจากประสบการณ์ POC:** demo ตัวนี้พอโชว์ลูกค้า/ผู้บริหารแล้ว สิ่งที่ถูกถามมากสุดไม่ใช่ฟีเจอร์ แต่คือ 2 คำถาม: "ใครเห็นข้อมูลอะไร" (ตอบด้วยบท 4.2) กับ "ตรวจย้อนหลังได้ไหม" (ตอบด้วย AUDIT log ข้างบน) — เตรียมสองเรื่องนี้ให้แน่นก่อนขึ้น production

---

⬅️ [5.2 Anthropic API](02-anthropic-api-mcp.md) | ➡️ [5.4 Custom Tools](04-custom-mcp-tools.md)
