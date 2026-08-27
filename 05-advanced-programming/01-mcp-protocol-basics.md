# 5.1 MCP Protocol: JSON-RPC และ Transports

> ระดับ: 🔴 Advanced | จำเป็นสำหรับทุกบทใน Part 5

Part 5 เราเปลี่ยนหมวก: จาก "ผู้ใช้ MCP" เป็น "ผู้สร้างระบบบน MCP" — เริ่มจากเข้าใจว่าใต้ฝากระโปรงมีอะไร

## MCP = JSON-RPC 2.0

ทุกการสื่อสารระหว่าง client (Claude) กับ server (tableau-mcp) คือข้อความ **JSON-RPC 2.0** — โปรโตคอลเรียบง่าย: request มี id, method, params / response ตอบกลับด้วย id เดิม

### ลำดับชีวิตของ session

```
Client                                Server
  │── initialize ────────────────────►│   แนะนำตัว + ต่อรอง capabilities
  │◄─── initialize result ────────────│
  │── notifications/initialized ─────►│
  │── tools/list ────────────────────►│   ขอรายการ tools
  │◄─── รายการ tools + schemas ───────│
  │── tools/call ────────────────────►│   เรียกใช้ tool
  │◄─── ผลลัพธ์ ──────────────────────│
```

### ตัวอย่างข้อความจริง

**Client ขอรายการ tools:**

```json
{ "jsonrpc": "2.0", "id": 1, "method": "tools/list" }
```

**Server ตอบ (ตัดมาบางส่วน):**

```json
{
  "jsonrpc": "2.0", "id": 1,
  "result": {
    "tools": [{
      "name": "query-datasource",
      "description": "Query data from a published data source...",
      "inputSchema": {
        "type": "object",
        "properties": {
          "datasourceLuid": { "type": "string" },
          "query": { "type": "object" }
        }
      }
    }]
  }
}
```

**จุดสำคัญที่สุดของทั้งบท:** `description` + `inputSchema` คือสิ่งเดียวที่ LLM ใช้ตัดสินใจว่าจะเรียก tool ไหน อย่างไร — เมื่อคุณสร้าง custom tool (บท 5.4) คุณภาพของ description = คุณภาพของ AI ที่ใช้ tool คุณ

**Client เรียก tool:**

```json
{
  "jsonrpc": "2.0", "id": 2,
  "method": "tools/call",
  "params": {
    "name": "query-datasource",
    "arguments": { "datasourceLuid": "abc-123", "query": { "...": "..." } }
  }
}
```

## Transports: stdio vs Streamable HTTP

JSON-RPC เดินทางได้ 2 ช่องทาง — เลือกผิดชีวิตยาก:

| | **stdio** | **Streamable HTTP** |
|---|---|---|
| การทำงาน | client spawn server เป็น child process คุยผ่าน stdin/stdout | server เป็น web service รับ HTTP POST (+ SSE stream ขากลับ) |
| ความสัมพันธ์ | 1 client : 1 server process | หลาย client : 1 server |
| Network | ไม่ต้องมี — อยู่เครื่องเดียวกัน | ต้องมี + ต้องคิดเรื่อง auth/TLS |
| เหมาะกับ | Claude Desktop ส่วนตัว, dev, POC | ทีม, web app, Claude API, production |
| ใน tableau-mcp | `TRANSPORT=stdio` (default) | `TRANSPORT=http` |

### กับดักคลาสสิกของ stdio ที่ dev ทุกคนเจอ

stdio ใช้ stdout เป็น "สายสัญญาณ" — ดังนั้น **ห้ามมีอะไร print ลง stdout นอกจาก JSON-RPC** ถ้าคุณ (หรือ library ที่ใช้) เผลอ `console.log("debug...")` ลง stdout = ข้อความปนเข้า stream = client parse พัง = MCP หลุดแบบงง ๆ

กติกา: **log ลง stderr เสมอ** (`console.error`) — จำข้อนี้ไว้ก่อนไปบท 5.4

## ดู traffic จริงด้วย MCP Inspector

ทฤษฎีข้างบนดูของจริงได้เลย:

```bash
cd tableau-mcp
npm run inspect
```

Inspector เป็น MCP client ตัวหนึ่ง — เปิดแท็บ network/history จะเห็น JSON-RPC ทุกข้อความ ทั้ง initialize, tools/list, tools/call ตรงตามที่อธิบาย ลองกดเรียก tool แล้วอ่าน request/response คู่กัน 10 นาทีนี้สอนได้มากกว่าอ่านสเปกหนึ่งชั่วโมง

## แผนที่ไป Part 5 ที่เหลือ

| ถ้าอยากทำ... | ไปบท |
|---|---|
| เรียก Tableau MCP จากโค้ด ผ่าน Claude API | 5.2 |
| สร้าง chat web app ให้คนในองค์กร | 5.3 |
| เพิ่ม tool ของตัวเองเข้า tableau-mcp | 5.4 |
| ตัดสินใจว่างานไหนควรใช้ REST API ตรง | 5.5 |
| เขียน VDS query เองแบบเต็มรูปแบบ | 5.6 |
| ทำ agent หลายขั้น / ใช้กับ Claude Code | 5.7 |

---

➡️ [5.2 เรียกผ่าน Anthropic API](02-anthropic-api-mcp.md)
