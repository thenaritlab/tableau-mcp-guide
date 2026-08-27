# 2.7 Troubleshooting: แก้ปัญหาที่เจอบ่อย

รวมปัญหาจริงที่เจอบ่อยที่สุด เรียงตามความถี่ พร้อมวิธีวินิจฉัยและแก้

## หลักการวินิจฉัยก่อนแก้

ปัญหา Tableau MCP แบ่งเป็น 3 ชั้น — หาให้เจอก่อนว่าพังชั้นไหน:

```
[Claude Desktop] ──(1) config/process──> [MCP Server] ──(2) network──> [Tableau] ──(3) auth/permission
```

- ชั้น 1 พัง → ไม่เห็น tableau ใน tools เลย
- ชั้น 2 พัง → เห็น tools แต่เรียกแล้ว timeout / connection error
- ชั้น 3 พัง → เรียกได้แต่ขึ้น 401 / 403 / sign-in failed

เครื่องมือที่ดีที่สุดในการแยกชั้น: **MCP Inspector** (`npm run inspect` — ดู[บท 2.4](04-claude-desktop-local.md)) ถ้า Inspector ใช้ได้แต่ Claude ไม่ได้ = ปัญหาอยู่ที่ config ฝั่ง Claude แน่นอน

---

## #1 ไม่เห็น tableau ในรายการ tools

**สาเหตุที่พบบ่อยสุด: JSON ผิด format**

- ลืม comma, comma เกิน, ลืมปิด `}` — เอาเนื้อหาไฟล์ไปวางเช็คที่ jsonlint.com
- Windows path ต้องใช้ `\\` ไม่ใช่ `\`

**สาเหตุ #2: Claude Desktop ไม่ได้ restart จริง**

- Windows: กด X = minimize เท่านั้น! ต้องคลิกขวา icon ใน system tray → **Quit**
- macOS: ต้อง `Cmd + Q`

**สาเหตุ #3: แก้ผิดไฟล์**

- ต้องเป็น `claude_desktop_config.json` ใน `%APPDATA%\Claude\` (Win) หรือ `~/Library/Application Support/Claude/` (macOS)
- ระวังไฟล์ชื่อคล้ายอย่าง `config.json` ในโฟลเดอร์เดียวกัน — ไม่ใช่ตัวนี้

**วิธีดู log:** Claude Desktop → Settings → Developer → จะเห็นสถานะ MCP server แต่ละตัว + ปุ่มเปิด log ไฟล์ (`mcp-server-tableau.log`)

---

## #2 (macOS) `spawn npx ENOENT` / command not found

Claude Desktop เปิดแบบ GUI จะไม่โหลด PATH จาก `.zshrc` — ถ้าติดตั้ง Node ผ่าน nvm/homebrew อาจหา `npx` ไม่เจอ

**วิธีแก้:** ระบุ full path ใน config

```bash
which npx
# เช่น /opt/homebrew/bin/npx
```

```json
"command": "/opt/homebrew/bin/npx",
"args": ["-y", "@tableau/mcp-server@latest"],
```

---

## #3 Error 401 / Sign-in failed

เช็คตามลำดับ:

1. **PAT หมดอายุ** (สาเหตุอันดับ 1) — PAT ตายเองถ้าไม่ใช้ต่อเนื่อง ~15 วัน → สร้างใหม่ อัปเดต `PAT_VALUE`
2. **PAT_NAME สะกดไม่ตรง** กับชื่อที่ตั้งใน Tableau (case-sensitive)
3. **SITE_NAME ผิด** — ต้องเป็น content URL ไม่ใช่ชื่อแสดงผล ดูจาก URL: `.../site/thenaritlab/home` → ใส่ `thenaritlab`
4. **Tableau Server + Default site** → `SITE_NAME` ต้องเป็น `""` (ว่าง) / **Tableau Cloud** → ห้ามว่าง
5. ทดสอบ PAT ตรง ๆ ด้วย curl ([บท 2.6](06-pat-setup.md)) เพื่อตัดตัวแปร MCP ออก

---

## #4 Error 403 Forbidden

Login ผ่านแล้วแต่ไม่มีสิทธิ์ทำสิ่งที่ขอ:

- Site Role ต่ำเกินไป (Viewer query datasource ตรงไม่ได้) → ขอ Explorer ขึ้นไป
- ไม่มี permission บน data source/workbook นั้น → เช็ค permission ใน Tableau ตามปกติ
- Data source ต้อง embed credentials หรือถาม credentials เพิ่ม → ใส่ env `DATASOURCE_CREDENTIALS` (ดู docs ทางการ)

---

## #5 SERVER URL ผิดรูปแบบ

- ต้องมี `https://` นำหน้า
- **ห้าม**มี `/` หรือ path ต่อท้าย เช่น ❌ `https://xxx.online.tableau.com/#/site/abc` → ✅ `https://xxx.online.tableau.com`
- Tableau Cloud ต้องใช้ pod URL ของคุณจริง ๆ (เช่น `prod-apnortheast-a`) — ดูได้จาก URL ตอน login

---

## #6 Query ได้แต่ช้ามาก / timeout

- Data source ใหญ่ + คำถามกว้างเกิน → ระบุ filter ใน prompt เช่น "เฉพาะปี 2026" "top 10"
- Extract ค้าง/ตาราง live ช้า → ปัญหาอยู่ฝั่ง data source ไม่ใช่ MCP ลองเปิด view เดียวกันใน Tableau เทียบความเร็ว
- npx ครั้งแรกต้องดาวน์โหลด package → ครั้งแรกช้าเป็นปกติ ครั้งต่อไปเร็วขึ้น

---

## #7 เคยใช้ได้ อยู่ ๆ พังหลังอัปเดต

`@latest` ดึงเวอร์ชันใหม่อัตโนมัติ ซึ่งบางครั้ง breaking change:

**วิธีแก้เฉพาะหน้า:** ปักหมุดเวอร์ชันที่เคยใช้ได้

```json
"args": ["-y", "@tableau/mcp-server@2.21.1"]
```

แล้วค่อยอ่าน [Release Notes](https://github.com/tableau/tableau-mcp/releases) ว่าต้องแก้ config อะไรก่อนขยับตาม

> 💡 สำหรับเครื่องที่ใช้ demo ลูกค้า แนะนำปักหมุดเวอร์ชันเสมอ อย่าใช้ `@latest`

---

## #8 องค์กรมี Proxy / SSL Interception

อาการ: `SELF_SIGNED_CERT_IN_CHAIN` หรือ connection ล้มเหลวเฉพาะในเครือข่ายบริษัท

- ขอไฟล์ CA cert ขององค์กรจากทีม IT แล้วชี้ด้วย env `NODE_EXTRA_CA_CERTS=/path/to/ca.pem`
- อย่าใช้ `NODE_TLS_REJECT_UNAUTHORIZED=0` ในงานจริง (ปิด SSL verify ทั้งหมด — อันตราย)

---

## ยังแก้ไม่ได้?

1. เปิด `DEFAULT_LOG_LEVEL: "debug"` ใน env แล้วอ่าน log
2. ค้นหา [Issues ของ repo ทางการ](https://github.com/tableau/tableau-mcp/issues) — ปัญหาส่วนใหญ่มีคนเจอมาก่อน
3. เปิด Issue ที่ repo นี้ พร้อมแนบ: OS, เวอร์ชัน Node, เวอร์ชัน tableau-mcp, ข้อความ error (ลบ PAT/URL จริงออกก่อน!)

---

⬅️ [2.6 สร้าง PAT](06-pat-setup.md) | ➡️ Part 3: Basic Usage (เร็ว ๆ นี้)
