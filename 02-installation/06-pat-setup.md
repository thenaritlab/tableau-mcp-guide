# 2.6 วิธีสร้าง Personal Access Token (PAT)

> ⏱️ เวลาที่ใช้: ~2 นาที | ระดับ: 🟢 Basic

PAT คือ "รหัสผ่านสำหรับโปรแกรม" — ใช้แทน username/password เมื่อ Tableau MCP ต้อง login เข้า Tableau แทนคุณ ข้อดีคือเพิกถอนได้ทันทีโดยไม่กระทบรหัสผ่านจริง และใช้ได้แม้องค์กรบังคับ MFA

## ขั้นตอนสร้าง PAT

1. Login เข้า Tableau Cloud / Tableau Server ผ่านเบราว์เซอร์
2. คลิกรูปโปรไฟล์มุมขวาบน → **My Account Settings**
3. เลื่อนหา section **Personal Access Tokens**
4. ช่อง **Token Name** ตั้งชื่อสื่อความหมาย เช่น `claude-mcp`
5. คลิก **Create Token** (หรือ Create new token)
6. หน้าต่างจะแสดง **Secret** — คลิก **Copy Secret** แล้ววางเก็บในที่ปลอดภัยทันที

> 🚨 **Secret แสดงครั้งเดียวเท่านั้น!** ปิดหน้าต่างแล้วดูอีกไม่ได้ ถ้าลืม copy ต้องลบ token แล้วสร้างใหม่

สิ่งที่ได้ 2 ค่า:

| ค่า | ใช้ใส่ใน config เป็น |
|---|---|
| ชื่อ token (เช่น `claude-mcp`) | `PAT_NAME` |
| Secret ที่ copy มา | `PAT_VALUE` |

## เรื่องที่ต้องรู้เกี่ยวกับ PAT

### อายุการใช้งาน

- PAT **หมดอายุเมื่อไม่ได้ใช้ต่อเนื่อง** (Tableau Cloud ค่า default: ไม่ใช้เกิน 15 วันติดต่อกัน token จะตาย) และมีอายุสูงสุดตามที่ admin ตั้ง (default 1 ปี)
- ถ้าอยู่ ๆ MCP ขึ้น 401 ทั้งที่เคยใช้ได้ → สาเหตุอันดับ 1 คือ PAT หมดอายุ สร้างใหม่แล้วอัปเดต config

### ทำไมสร้าง PAT ไม่ได้?

- บางองค์กรปิดสิทธิ์สร้าง PAT สำหรับ role ทั่วไป (ตั้งค่าได้ระดับ site) → ติดต่อ Tableau Admin
- ถ้า admin ไม่อนุญาตจริง ๆ ทางเลือกคือใช้ [Hosted MCP + OAuth](02-hosted-endpoint.md) (Cloud เท่านั้น)

### Best Practices

1. **แยก token ต่อการใช้งาน** — `claude-mcp`, `python-scripts`, `tabcmd` แยกกัน จะได้เพิกถอนเป็นรายตัวได้
2. **อย่า hardcode secret ลงในโค้ดหรือ commit ลง git** — ใส่ผ่าน env variable / secret manager เสมอ
3. **งานองค์กร:** สร้าง service account แยกจากบัญชีส่วนตัว แล้วออก PAT จากบัญชีนั้น — คนลาออกแล้ว token ไม่ตายตามบัญชี
4. ตั้ง reminder ต่ออายุ token ก่อนวันหมดอายุ โดยเฉพาะถ้าใช้ใน demo/POC ที่มีนัดกับลูกค้า 😅

## ทดสอบ PAT ว่าใช้ได้ (ไม่ต้องรอ MCP)

ยิง REST API ตรง ๆ ด้วย curl:

```bash
curl -s -X POST "https://YOUR-SERVER/api/3.24/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{
    "credentials": {
      "personalAccessTokenName": "claude-mcp",
      "personalAccessTokenSecret": "YOUR_SECRET",
      "site": { "contentUrl": "your_site_name" }
    }
  }'
```

ได้ response ที่มี `<credentials token="...">` หรือ JSON ที่มี token = PAT ใช้งานได้
ได้ 401 = ชื่อ/secret/site ผิด หรือ token หมดอายุ

---

⬅️ [2.5 Docker](05-docker-setup.md) | ➡️ [2.7 Troubleshooting](07-troubleshooting.md)
