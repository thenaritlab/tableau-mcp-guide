# 6.2 Self-Hosted Deployment สำหรับ Tableau Server

> ระดับ: 🔴 Advanced | ต่อยอดจาก: บท 2.5 (Docker) + 6.1 (Security)

บท 2.5 รัน container เดียวบนเครื่อง dev — บทนี้คือการยกไปเป็น **service ขององค์กร**: อยู่ยาว อัปเดตเป็นระบบ ล่มแล้วรู้

## Reference Architecture

```
                    ┌────────────────────── DMZ/App Zone ──────────────────────┐
[ผู้ใช้/แอป]  ──TLS──►  [Reverse Proxy + Auth]  ──►  [Tableau MCP container(s)]
                    │        (nginx/Traefik)              │                    │
                    └─────────────────────────────────────┼────────────────────┘
                                                          ▼
                                              [Tableau Server on-premise]
                                                          ▲
                                              [Secret Manager] (PAT)
                                              [Log/Monitoring stack]
```

หลัก: MCP อยู่ใกล้ Tableau Server (latency ต่ำ, ไม่ข้ามโซน), ทุกทางเข้าออกผ่าน proxy, PAT มาจาก secret manager ตอน start เท่านั้น

## Docker Compose สำหรับ production

```yaml
# docker-compose.yml
services:
  tableau-mcp:
    image: registry.company.co.th/bi/tableau-mcp:2.21.1   # ปักหมุดเวอร์ชันเสมอ!
    restart: unless-stopped
    environment:
      TRANSPORT: http
      SERVER: https://tableau.company.co.th
      SITE_NAME: ""                        # Server default site = ว่าง
      DEFAULT_LOG_LEVEL: info
      INCLUDE_TOOLS: list-datasources,list-fields,query-datasource
      # PAT ไม่อยู่ในไฟล์นี้ — inject ตอน deploy:
      PAT_NAME: ${PAT_NAME}
      PAT_VALUE: ${PAT_VALUE}
    ports:
      - "127.0.0.1:3927:3927"              # bind localhost เท่านั้น proxy คุยแทน
    logging:
      driver: json-file
      options: { max-size: "50m", max-file: "5" }
    healthcheck:
      test: ["CMD-SHELL", "node -e \"fetch('http://localhost:3927/').then(()=>process.exit(0)).catch(()=>process.exit(1))\""]
      interval: 30s
      timeout: 5s
      retries: 3
```

จุดตัดสินใจสำคัญในไฟล์นี้:

1. **ปักหมุดเวอร์ชัน image** — build image เองจาก tag ของ repo (บท 2.5) push เข้า registry องค์กร ห้ามใช้ `latest` ใน production
2. **bind 127.0.0.1** — container ไม่โผล่ network ตรง proxy (บท 6.1 ชั้น 2-3) เป็นทางเข้าเดียว
3. **PAT จาก environment ตอน deploy** — CI/CD ดึงจาก secret manager แล้ว inject ไม่เขียนลงไฟล์

## SSL ภายในองค์กร (จุดตายเฉพาะ on-premise)

Tableau Server ส่วนใหญ่ใช้ cert จาก internal CA — Node ใน container ไม่รู้จัก:

```yaml
    environment:
      NODE_EXTRA_CA_CERTS: /certs/company-ca.pem
    volumes:
      - ./certs/company-ca.pem:/certs/company-ca.pem:ro
```

ทดสอบด้วย `docker exec` เข้าไป `curl https://tableau.company.co.th` ต้องผ่านโดยไม่ต้อง `-k`

## เวอร์ชันอัปเกรด: ทำเป็นพิธีกรรม ไม่ใช่อุบัติเหตุ

tableau-mcp ออก release ถี่ — วางรอบของตัวเอง (เช่น รายเดือน):

```
1. อ่าน release notes ทุกเวอร์ชันที่ข้าม — หา breaking changes
   (ชื่อ tool เปลี่ยน = แอป/prompt ที่อ้างชื่อ tool พังได้)
2. Build image เวอร์ชันใหม่ → deploy ที่ staging
3. รัน smoke test: list tools, query ตัวแทน 3 แบบ, RLS test 4 case (บท 4.2)
4. Deploy production นอกเวลางาน + เตรียม rollback (แก้ tag เดียวใน compose)
5. จด CHANGELOG ภายใน: เวอร์ชัน, วันที่, สิ่งที่เปลี่ยน
```

## HA / Scaling (ทำเมื่อจำเป็นจริง)

ข่าวดี: MCP server แบบนี้ **stateless** (ไม่มี session data ค้าง) — scale ง่าย:

- รัน 2+ replicas หลัง load balancer ได้เลย (sticky session แนะนำสำหรับ streaming)
- คอขวดจริงมักอยู่ที่ **Tableau Server / VDS** ไม่ใช่ MCP — ถ้า query ช้า scale MCP ไม่ช่วย ให้ดู extract, VizQL server process, และขนาดคำถาม (limit!) ก่อน
- สำหรับองค์กรส่วนใหญ่: 1 container + restart policy + monitoring เพียงพอไปอีกนาน — อย่า over-engineer วันแรก

## Runbook ขั้นต่ำที่ต้องเขียน (ครึ่งหน้าก็ยังดี)

| เหตุการณ์ | ต้องรู้ว่า |
|---|---|
| MCP ไม่ตอบ | ดู log ที่ไหน, restart ยังไง, ใครรับผิดชอบ |
| 401 จาก Tableau | ขั้นตอน rotate PAT (บท 2.6) + จุดอัปเดต secret |
| ผลตอบช้าผิดปกติ | เช็คลำดับ: Tableau load → ขนาด query → network |
| สงสัย credential หลุด | revoke ทันทีที่ไหน แจ้งใคร |
| อัปเกรดแล้วพัง | rollback: แก้ tag → `docker compose up -d` |

---

⬅️ [6.1 Security Hardening](01-security-hardening.md) | ➡️ [6.3 Governance](03-governance.md)
