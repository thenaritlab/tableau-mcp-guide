# ตัวอย่าง claude_desktop_config.json ทุกแบบ

เลือกไฟล์ตามสถานการณ์ → copy เนื้อหาไปใส่ `claude_desktop_config.json` (ตำแหน่งไฟล์ดู[บท 2.3](../../02-installation/03-claude-desktop-npx.md)) → แก้ค่าของคุณ → restart Claude Desktop

| ไฟล์ | สถานการณ์ |
|---|---|
| `01-npx-basic.json` | มาตรฐาน — Cloud หรือ Server ผ่าน npx |
| `02-npx-pinned-version.json` | ปักหมุดเวอร์ชัน (เครื่อง demo/production) |
| `03-npx-limited-tools.json` | เปิดเฉพาะ query read-only |
| `04-local-build.json` | ใช้ build จาก clone (บท 2.4) |
| `05-remote-http.json` | ต่อ MCP server กลางผ่าน mcp-remote |
| `06-multi-server.json` | Cloud + Server สองตัวพร้อมกัน |

⚠️ ทุกไฟล์มี placeholder `YOUR_...` ต้องแก้ก่อนใช้ และ**อย่า commit ไฟล์ที่ใส่ PAT จริงลง git**
