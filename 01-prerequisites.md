# 2.1 สิ่งที่ต้องเตรียมก่อนติดตั้ง (Prerequisites)

ก่อนติดตั้ง Tableau MCP ให้เช็คลิสต์นี้ให้ครบก่อน จะช่วยประหยัดเวลาแก้ปัญหาทีหลังได้มาก

## เลือกเส้นทางการติดตั้งของคุณก่อน

| คุณใช้อะไร | วิธีที่แนะนำ | ไปที่บท |
|---|---|---|
| Tableau Cloud + Claude paid plan | **Hosted MCP** (ง่ายสุด ไม่ต้องติดตั้งอะไร) | [2.2](02-hosted-endpoint.md) |
| Tableau Cloud หรือ Server + Claude Desktop | **npx** (ไม่ต้อง clone code) | [2.3](03-claude-desktop-npx.md) |
| ต้องการแก้ code / debug / ศึกษา internals | **Local build** | [2.4](04-claude-desktop-local.md) |
| องค์กร ต้องการให้หลายคนใช้ร่วมกัน | **Docker (streamable-http)** | [2.5](05-docker-setup.md) |

## Checklist ทั่วไป

### 1. บัญชี Tableau

- [ ] มีบัญชี Tableau Cloud หรือ Tableau Server ที่ login ได้
- [ ] รู้ **Server URL** ของคุณ เช่น `https://prod-apnortheast-a.online.tableau.com`
- [ ] รู้ **Site Name** (ดูจาก URL หลัง `/site/` เช่น `.../site/mysite/...` → site name คือ `mysite`)
- [ ] Site Role เป็น **Explorer ขึ้นไป** (Viewer ใช้ query data source ไม่ได้ในบางกรณี)

> 💡 **Tips:** ถ้าใช้ Tableau Cloud แล้วอยู่ที่ default site บางครั้ง SITE_NAME ต้องใส่เป็นชื่อ site จริง ไม่สามารถเว้นว่างได้เหมือน Tableau Server

### 2. Personal Access Token (PAT)

จำเป็นสำหรับทุกวิธียกเว้น Hosted MCP (ที่ใช้ OAuth แทน)

- [ ] สร้าง PAT แล้ว (ดูวิธีที่ [บท 2.6](06-pat-setup.md))
- [ ] จด **PAT Name** และ **PAT Secret** ไว้ (Secret เห็นครั้งเดียวตอนสร้าง!)

> ⚠️ **ข้อควรระวังในองค์กร:** บางองค์กรปิดการสร้าง PAT สำหรับ role ที่ไม่ใช่ admin ถ้าสร้างไม่ได้ให้ติดต่อ Tableau Admin ของบริษัท

### 3. เครื่องของคุณ (สำหรับวิธี npx / local / Docker)

- [ ] **Node.js 22.7.5 ขึ้นไป** — เช็คด้วย `node --version`
  - ดาวน์โหลด: https://nodejs.org/en/download
  - แนะนำ LTS ล่าสุด
- [ ] **Claude Desktop** ติดตั้งแล้ว — https://claude.ai/download
- [ ] (เฉพาะ local build) **Git** — https://git-scm.com
- [ ] (เฉพาะ Docker) **Docker Desktop** หรือ Podman

### 4. เช็ค Node.js บน Windows

เปิด Command Prompt หรือ PowerShell:

```powershell
node --version
# ต้องได้ v22.7.5 ขึ้นไป เช่น v22.11.0

npx --version
# ต้องมีค่าออกมา เช่น 10.9.0
```

ถ้าติดตั้ง Node.js แล้วแต่คำสั่งไม่เจอ ให้ปิด-เปิด terminal ใหม่ หรือ restart เครื่อง (PATH ยังไม่อัปเดต)

### 5. เช็ค Node.js บน macOS

```bash
node --version
which node
# จดตำแหน่งไว้ เช่น /opt/homebrew/bin/node — บางครั้งต้องใช้ full path ใน config
```

> 💡 **ปัญหาคลาสสิกบน macOS:** ติดตั้ง Node ผ่าน nvm แล้ว Claude Desktop หา `npx` ไม่เจอ เพราะ Claude Desktop ไม่ได้โหลด shell profile — วิธีแก้อยู่ใน [บท 2.7 Troubleshooting](07-troubleshooting.md)

## ข้อมูลที่ต้องจดเตรียมไว้ (กรอกลงตารางนี้ได้เลย)

| รายการ | ค่าของคุณ | ตัวอย่าง |
|---|---|---|
| SERVER | | `https://prod-apnortheast-a.online.tableau.com` |
| SITE_NAME | | `thenaritlab` |
| PAT_NAME | | `claude-mcp` |
| PAT_VALUE | | `AbCdEf12...` (เก็บเป็นความลับ!) |

## Site Role ที่แนะนำสำหรับแต่ละการใช้งาน

| การใช้งาน | Site Role ขั้นต่ำ |
|---|---|
| Query data source, ดู view | Explorer |
| ดู metadata ครบถ้วน | Explorer (Can Publish) |
| งาน admin (users, permissions) | Site Administrator |

พร้อมแล้ว → ไปติดตั้งกันที่ [บท 2.2 (Hosted)](02-hosted-endpoint.md) หรือ [บท 2.3 (npx)](03-claude-desktop-npx.md)
