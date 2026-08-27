# 2.3 ติดตั้งบน Claude Desktop ด้วย npx (แนะนำสำหรับ Tableau Server)

> ⏱️ เวลาที่ใช้: ~15 นาที | ระดับ: 🟢 Basic | เหมาะกับ: Tableau Cloud **และ** Tableau Server

วิธีนี้ใช้ npm package ทางการ `@tableau/mcp-server` รันผ่าน `npx` — **ไม่ต้อง clone repo, ไม่ต้อง build** Claude Desktop จะดึง package ล่าสุดมารันให้อัตโนมัติทุกครั้งที่เปิดโปรแกรม

## สิ่งที่ต้องมี

- Node.js **22.7.5+** (`node --version` เช็คก่อน)
- Claude Desktop
- PAT (Personal Access Token) — ยังไม่มี? ไปสร้างที่ [บท 2.6](06-pat-setup.md) ก่อน ใช้เวลา 2 นาที

## Step 1 — เปิดไฟล์ config ของ Claude Desktop

ตำแหน่งไฟล์ `claude_desktop_config.json`:

| OS | Path |
|---|---|
| **Windows** | `%APPDATA%\Claude\claude_desktop_config.json` |
| **macOS** | `~/Library/Application Support/Claude/claude_desktop_config.json` |

วิธีเปิดจากในแอปเลย (ง่ายกว่า):
**Claude Desktop → Settings → Developer → Edit Config**

> 💡 ถ้ายังไม่เคยตั้งค่า MCP มาก่อน ไฟล์อาจว่างเปล่าหรือมีแค่ `{}`

## Step 2 — ใส่ config

วางเนื้อหานี้ลงไป (แก้ค่า 4 ตัวเป็นของคุณ):

```json
{
  "mcpServers": {
    "tableau": {
      "command": "npx",
      "args": ["-y", "@tableau/mcp-server@latest"],
      "env": {
        "SERVER": "https://prod-apnortheast-a.online.tableau.com",
        "SITE_NAME": "your_site_name",
        "PAT_NAME": "claude-mcp",
        "PAT_VALUE": "your-pat-secret-here"
      }
    }
  }
}
```

### อธิบายแต่ละค่า

| Key | คืออะไร | ตัวอย่าง |
|---|---|---|
| `SERVER` | URL ของ Tableau Cloud/Server (ไม่ต้องมี `/` ปิดท้าย) | `https://tableau.mycompany.co.th` |
| `SITE_NAME` | ชื่อ site — ดูจาก URL หลัง `/site/` | `thenaritlab` |
| `PAT_NAME` | ชื่อ token ที่ตั้งตอนสร้าง PAT | `claude-mcp` |
| `PAT_VALUE` | Secret ของ PAT (เห็นครั้งเดียวตอนสร้าง) | `AbCd1234...==:xYz...` |

> ⚠️ **Tableau Server ที่ใช้ Default site:** ใส่ `SITE_NAME` เป็นค่าว่าง `""`
> ⚠️ **Tableau Cloud:** SITE_NAME ห้ามว่าง ต้องใส่ชื่อ site เสมอ

### ถ้ามี MCP server อื่นอยู่แล้ว

เพิ่ม `"tableau": {...}` เข้าไปใน `mcpServers` เดิม อย่าลืม comma คั่น:

```json
{
  "mcpServers": {
    "filesystem": { "...": "existing server" },
    "tableau": {
      "command": "npx",
      "args": ["-y", "@tableau/mcp-server@latest"],
      "env": {
        "SERVER": "https://...",
        "SITE_NAME": "...",
        "PAT_NAME": "...",
        "PAT_VALUE": "..."
      }
    }
  }
}
```

## Step 3 — Restart Claude Desktop

ปิด Claude Desktop **ให้สนิท** แล้วเปิดใหม่:

- **Windows:** คลิกขวาที่ไอคอนใน system tray → Quit (การกด X เฉย ๆ แค่ minimize!)
- **macOS:** `Cmd + Q`

## Step 4 — ตรวจสอบว่า MCP ทำงาน

1. เปิดแชทใหม่
2. มองหาไอคอน 🔌 หรือ slider (search & tools) ใต้ช่องพิมพ์
3. ควรเห็น **tableau** ในรายการ tools

ทดสอบด้วย prompt:

```
List the data sources on my Tableau site
```

Claude จะขออนุญาตเรียกใช้ tool ครั้งแรก → กด **Allow**

ถ้าได้รายชื่อ data source กลับมา = สำเร็จ! 🎉

## Step 5 (Optional) — จำกัด tools ที่เปิดใช้

ถ้าต้องการเปิดเฉพาะบาง tool (เช่น ให้ query ได้อย่างเดียว ไม่ให้ทำงาน admin) เพิ่ม env:

```json
"env": {
  "...": "...",
  "INCLUDE_TOOLS": "list-datasources,query-datasource,list-fields"
}
```

หรือกลับกัน ใช้ `EXCLUDE_TOOLS` เพื่อตัดบาง tool ออก — มีประโยชน์มากตอนทำ demo ให้ลูกค้าที่กังวลเรื่อง scope การเข้าถึง

## เกิดปัญหา?

| อาการ | ไปที่ |
|---|---|
| ไม่เห็น tableau ใน tools | [Troubleshooting #1](07-troubleshooting.md) |
| Error 401 / Sign-in failed | [Troubleshooting #3](07-troubleshooting.md) |
| `npx` command not found (macOS) | [Troubleshooting #2](07-troubleshooting.md) |

---

⬅️ [2.2 Hosted MCP](02-hosted-endpoint.md) | ➡️ [2.4 ติดตั้งแบบ Local build](04-claude-desktop-local.md)
