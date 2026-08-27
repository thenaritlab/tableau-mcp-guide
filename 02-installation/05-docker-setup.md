# 2.5 ติดตั้งด้วย Docker (streamable-http)

> ⏱️ เวลาที่ใช้: ~30 นาที | ระดับ: 🟡 Intermediate | เหมาะกับ: ทีม/องค์กรที่อยากให้หลายคนใช้ MCP server ตัวเดียวกัน

การรันใน container ด้วย transport แบบ **streamable-http** ทำให้ MCP server กลายเป็น service ที่เข้าถึงผ่าน network ได้ — client หลายตัว (Claude Desktop หลายเครื่อง, web app, Claude API) ต่อเข้า server เดียวกันได้ ต่างจาก stdio ที่ผูก 1:1 กับ client บนเครื่องเดียว

```
[Claude Desktop เครื่อง A] ─┐
[Claude Desktop เครื่อง B] ─┼── HTTP ──> [Tableau MCP Container] ──> [Tableau Cloud/Server]
[Web App / Claude API]     ─┘
```

## Step 1 — Build Image

```bash
git clone https://github.com/tableau/tableau-mcp.git
cd tableau-mcp

docker build -t tableau-mcp .
# ใช้ Podman ก็ได้: podman build -t tableau-mcp .
```

## Step 2 — เตรียมไฟล์ env

สร้างไฟล์ `env.list` (ดูตัวอย่างจาก `env.example.list` ใน repo):

```
TRANSPORT=http
SERVER=https://prod-apnortheast-a.online.tableau.com
SITE_NAME=your_site_name
PAT_NAME=claude-mcp
PAT_VALUE=your-pat-secret
DEFAULT_LOG_LEVEL=info
```

> 🔒 อย่า commit ไฟล์นี้ลง git! เพิ่ม `env.list` ใน `.gitignore` เสมอ

## Step 3 — Run Container

```bash
docker run -d \
  --name tableau-mcp \
  --env-file env.list \
  -p 3927:3927 \
  tableau-mcp
```

เช็คว่า server รันอยู่:

```bash
docker logs tableau-mcp
# ควรเห็น log บอกว่า server listening
```

## Step 4 — ต่อจาก Claude Desktop

Claude Desktop คุยกับ remote MCP ผ่าน HTTP ได้ 2 ทาง:

### ทางที่ 1: Custom Connector (ง่ายสุด)

Settings → Connectors → Add custom connector → ใส่ `http://your-server:3927/mcp`
(เหมาะเมื่อ deploy บน server จริงที่มี HTTPS)

### ทางที่ 2: ผ่าน mcp-remote bridge

สำหรับทดสอบ local ที่ยังเป็น http:

```json
{
  "mcpServers": {
    "tableau": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://localhost:3927/mcp"]
    }
  }
}
```

## Step 5 — ทดสอบ

เหมือนบทก่อนหน้า — restart Claude, เช็ค tools, ลอง `List my data sources`

## ⚠️ คำเตือนสำหรับ Production

การเปิด MCP server ให้เข้าถึงผ่าน network = เปิดประตูเข้า Tableau ด้วยสิทธิ์ของ PAT ที่ฝังไว้ **ทุกคนที่ยิง HTTP ถึง server นี้ได้จะ query ข้อมูลด้วยสิทธิ์นั้น**

ขั้นต่ำที่ต้องทำก่อนใช้จริงในองค์กร:

1. **HTTPS เท่านั้น** — ใส่ reverse proxy (nginx/Traefik) + TLS cert
2. **Authentication ชั้นหน้า** — API key, OAuth, หรือ network-level (VPN, IP allowlist)
3. **PAT สิทธิ์ต่ำสุด** — สร้าง service account แยก ให้สิทธิ์เฉพาะที่จำเป็น
4. **จำกัด tools** — ใช้ `INCLUDE_TOOLS` เปิดเฉพาะ tool ที่ต้องใช้
5. **Log ทุก request** — เพื่อ audit ว่าใคร query อะไร

รายละเอียดเชิงลึกอยู่ที่ Part 6.1: Security Hardening

## คำสั่ง Docker ที่ใช้บ่อย

```bash
docker stop tableau-mcp          # หยุด
docker start tableau-mcp         # เริ่มใหม่
docker logs -f tableau-mcp       # ดู log แบบ realtime
docker rm -f tableau-mcp         # ลบ container (rebuild ใหม่)
```

---

⬅️ [2.4 Local build](04-claude-desktop-local.md) | ➡️ [2.6 สร้าง PAT](06-pat-setup.md)
