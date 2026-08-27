# 2.4 ติดตั้งแบบ Local (Clone + Build)

> ⏱️ เวลาที่ใช้: ~30 นาที | ระดับ: 🟡 Intermediate | เหมาะกับ: คนที่อยากศึกษา internals, แก้ code, debug, หรือทำ custom tools

วิธีนี้ clone source code (TypeScript) มา build เอง — จำเป็นถ้าคุณจะ:

- ศึกษาว่าแต่ละ tool ทำงานอย่างไร (เตรียมไปต่อ Part 5: Custom Tools)
- ปักหมุดเวอร์ชันไว้ ไม่อยากให้อัปเดตอัตโนมัติ (สำคัญกับงาน production/demo)
- แก้ log level, debug ปัญหาการเชื่อมต่อ

## Step 1 — Clone และ Build

```bash
# เลือกโฟลเดอร์ที่ต้องการ เช่น C:\dev หรือ ~/dev
cd C:\dev

git clone https://github.com/tableau/tableau-mcp.git
cd tableau-mcp

npm install
npm run build
```

ผลลัพธ์: ได้โฟลเดอร์ `build/` ที่มี `index.js` — นี่คือตัว server

> 💡 อยากปักหมุดเวอร์ชัน? `git checkout v2.21.1` (ดู tag ทั้งหมด: `git tag`)

## Step 2 — ทดสอบรันด้วย MCP Inspector (แนะนำมาก)

ก่อนผูกกับ Claude ให้ทดสอบ server เดี่ยว ๆ ก่อนด้วย MCP Inspector:

```bash
# แก้ไฟล์ config.stdio.json ใส่ค่า SERVER, SITE_NAME, PAT_NAME, PAT_VALUE ของคุณก่อน
npm run inspect
```

เบราว์เซอร์จะเปิดหน้า Inspector → กด **Connect** → ไปแท็บ **Tools** → กด **List Tools**

ลองรัน tool `list-datasources` ดูว่าได้ผลลัพธ์กลับมาไหม — ถ้าได้แปลว่า server + credentials ถูกต้องแล้ว ปัญหาที่เหลือ (ถ้ามี) จะอยู่ฝั่ง Claude config เท่านั้น เทคนิคนี้ช่วยแยกปัญหาได้ชัดเจนมาก

## Step 3 — ผูกกับ Claude Desktop

เปิด `claude_desktop_config.json` (ตำแหน่งดู[บท 2.3](03-claude-desktop-npx.md)) แล้วใส่:

```json
{
  "mcpServers": {
    "tableau": {
      "command": "node",
      "args": ["C:\\dev\\tableau-mcp\\build\\index.js"],
      "env": {
        "TRANSPORT": "stdio",
        "SERVER": "https://prod-apnortheast-a.online.tableau.com",
        "SITE_NAME": "your_site_name",
        "PAT_NAME": "claude-mcp",
        "PAT_VALUE": "your-pat-secret",
        "DEFAULT_LOG_LEVEL": "debug"
      }
    }
  }
}
```

จุดสำคัญ:

- **Windows:** path ใช้ `\\` (double backslash) เช่น `C:\\dev\\tableau-mcp\\build\\index.js`
- **macOS:** ใช้ full path ปกติ เช่น `/Users/narit/dev/tableau-mcp/build/index.js` และถ้าใช้ nvm อาจต้องระบุ `command` เป็น full path ของ node เช่น `/Users/narit/.nvm/versions/node/v22.11.0/bin/node`
- `TRANSPORT: "stdio"` คือการสื่อสารผ่าน standard input/output — เหมาะกับการรัน local คู่กับ Claude Desktop

## Step 4 — Restart Claude Desktop และทดสอบ

เหมือน[บท 2.3 Step 3-4](03-claude-desktop-npx.md) — Quit ให้สนิท เปิดใหม่ เช็ค tools แล้วลอง prompt

## การอัปเดตเวอร์ชัน

```bash
cd C:\dev\tableau-mcp
git pull
npm install
npm run build
# แล้ว restart Claude Desktop
```

> ⚠️ อ่าน [Release Notes](https://github.com/tableau/tableau-mcp/releases) ก่อนอัปเดตเสมอ — ชื่อ tool หรือ env variable อาจเปลี่ยนระหว่าง major version

## โครงสร้าง Source Code ที่ควรรู้ (เตรียมไป Part 5)

```
tableau-mcp/
├── src/
│   ├── server.ts          # จุดเริ่มต้น MCP server
│   ├── tools/             # โค้ดของแต่ละ tool ⭐ อ่านตรงนี้ก่อน
│   └── sdks/              # ตัวเรียก Tableau REST API / VDS
├── config.stdio.json      # config ตัวอย่างสำหรับ stdio
├── config.http.json       # config ตัวอย่างสำหรับ streamable-http
└── Dockerfile             # สำหรับ build image (บท 2.5)
```

---

⬅️ [2.3 npx](03-claude-desktop-npx.md) | ➡️ [2.5 Docker Setup](05-docker-setup.md)
