# 📊 Tableau MCP Guide (ภาษาไทย)

> คู่มือ Tableau MCP ฉบับสมบูรณ์ที่สุดในภาษาไทย — ตั้งแต่เริ่มต้นจนถึงระดับ Enterprise
> โดย [The Narit Lab](https://github.com/thenaritlab)

[![Tableau MCP](https://img.shields.io/badge/Tableau-MCP-blue)](https://github.com/tableau/tableau-mcp)
[![Language: Thai](https://img.shields.io/badge/Language-ไทย-red)]()
[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey)](https://creativecommons.org/licenses/by/4.0/deed.th)

---

## 🎯 คู่มือนี้คืออะไร

**Tableau MCP** คือ MCP Server อย่างเป็นทางการจาก Tableau ที่ทำให้ AI (เช่น Claude) สามารถ "มองเห็นและเข้าใจข้อมูล" ใน Tableau Cloud / Tableau Server ของคุณได้โดยตรง — ถามคำถามกับข้อมูลด้วยภาษาธรรมชาติ ค้นหา workbook, query data source, อ่าน Pulse metrics ได้ทั้งหมดผ่านการสนทนา

คู่มือนี้เขียนจากประสบการณ์ทำงานจริงกับลูกค้าองค์กรในประเทศไทย ครอบคลุมตั้งแต่การติดตั้งครั้งแรก ไปจนถึงการเขียนโปรแกรมเรียกใช้ผ่าน API และการ deploy ระดับองค์กร

## 📚 สารบัญ

### Part 1 — Introduction (เริ่มต้นทำความรู้จัก)
| บท | หัวข้อ | ระดับ |
|---|---|---|
| 1.1 | [MCP คืออะไร ทำไมถึงสำคัญ](01-introduction/01-what-is-mcp.md) | 🟢 Basic |
| 1.2 | [Tableau MCP คืออะไร + Architecture](01-introduction/02-what-is-tableau-mcp.md) | 🟢 Basic |
| 1.3 | [Use Cases: ใช้ทำอะไรได้บ้าง](01-introduction/03-use-cases.md) | 🟢 Basic |
| 1.4 | [Tableau Cloud vs Tableau Server ต่างกันอย่างไร](01-introduction/04-cloud-vs-server.md) | 🟢 Basic |

### Part 2 — Installation (การติดตั้ง)
| บท | หัวข้อ | ระดับ |
|---|---|---|
| 2.1 | [สิ่งที่ต้องเตรียมก่อนติดตั้ง](02-installation/01-prerequisites.md) | 🟢 Basic |
| 2.2 | [วิธีที่ง่ายที่สุด: Hosted MCP (mcp.tableau.com)](02-installation/02-hosted-endpoint.md) | 🟢 Basic |
| 2.3 | [ติดตั้งบน Claude Desktop ด้วย npx](02-installation/03-claude-desktop-npx.md) | 🟢 Basic |
| 2.4 | [ติดตั้งแบบ Local (clone + build)](02-installation/04-claude-desktop-local.md) | 🟡 Intermediate |
| 2.5 | [ติดตั้งด้วย Docker](02-installation/05-docker-setup.md) | 🟡 Intermediate |
| 2.6 | [วิธีสร้าง Personal Access Token (PAT)](02-installation/06-pat-setup.md) | 🟢 Basic |
| 2.7 | [Troubleshooting: แก้ปัญหาที่เจอบ่อย](02-installation/07-troubleshooting.md) | 🟢 Basic |

### Part 3 — Basic Usage (การใช้งานพื้นฐาน)
| บท | หัวข้อ | ระดับ |
|---|---|---|
| 3.1 | [บทสนทนาแรกกับข้อมูลของคุณ](03-basic-usage/01-first-conversation.md) | 🟢 Basic |
| 3.2 | [Tools ทั้งหมดของ Tableau MCP](03-basic-usage/02-available-tools.md) | 🟢 Basic |
| 3.3 | [Query Data Source ด้วยภาษาธรรมชาติ](03-basic-usage/03-query-datasource.md) | 🟢 Basic |
| 3.4 | [ค้นหาและสำรวจ Workbook / View](03-basic-usage/04-explore-workbooks.md) | 🟢 Basic |
| 3.5 | [อ่าน Pulse Metrics ผ่าน Claude](03-basic-usage/05-pulse-metrics.md) | 🟢 Basic |

### Part 4 — Intermediate (ระดับกลาง)
| บท | หัวข้อ | ระดับ |
|---|---|---|
| 4.1 | [Prompt Patterns: เขียน prompt ให้ query แม่นยำ](04-intermediate/01-prompt-patterns.md) | 🟡 Intermediate |
| 4.2 | [Row Level Security (RLS) กับ MCP](04-intermediate/02-rls-and-permissions.md) | 🟡 Intermediate |
| 4.3 | [วิเคราะห์ข้ามหลาย Data Source](04-intermediate/03-multi-datasource.md) | 🟡 Intermediate |
| 4.4 | [สร้าง Documentation ของ Workbook อัตโนมัติ](04-intermediate/04-dashboard-documentation.md) | 🟡 Intermediate |
| 4.5 | [Workflow กับ Claude Projects](04-intermediate/05-claude-projects-workflow.md) | 🟡 Intermediate |

### Part 5 — Advanced Programming (ระดับสูง)
| บท | หัวข้อ | ระดับ |
|---|---|---|
| 5.1 | [MCP Protocol: JSON-RPC, stdio vs streamable-http](05-advanced-programming/01-mcp-protocol-basics.md) | 🔴 Advanced |
| 5.2 | [เรียก Tableau MCP ผ่าน Anthropic API](05-advanced-programming/02-anthropic-api-mcp.md) | 🔴 Advanced |
| 5.3 | [สร้าง Web App Chat กับ Tableau](05-advanced-programming/03-build-chat-webapp.md) | 🔴 Advanced |
| 5.4 | [Fork และเขียน Custom Tool เพิ่มเอง](05-advanced-programming/04-custom-mcp-tools.md) | 🔴 Advanced |
| 5.5 | [REST API vs MCP: เลือกใช้เมื่อไหร่](05-advanced-programming/05-rest-api-vs-mcp.md) | 🔴 Advanced |
| 5.6 | [VizQL Data Service (VDS) Deep Dive](05-advanced-programming/06-vds-deep-dive.md) | 🔴 Advanced |
| 5.7 | [Agentic Workflows กับ Claude Code](05-advanced-programming/07-agentic-workflows.md) | 🔴 Advanced |

### Part 6 — Enterprise (ระดับองค์กร)
| บท | หัวข้อ | ระดับ |
|---|---|---|
| 6.1 | [Security Hardening สำหรับ Production](06-enterprise/01-security-hardening.md) | 🔴 Advanced |
| 6.2 | [Self-Hosted Deployment สำหรับ Tableau Server](06-enterprise/02-self-hosted-deployment.md) | 🔴 Advanced |
| 6.3 | [Governance และการควบคุมสิทธิ์](06-enterprise/03-governance.md) | 🔴 Advanced |
| 6.4 | [POC Checklist สำหรับองค์กร](06-enterprise/04-poc-checklist.md) | 🔴 Advanced |

### 📦 Examples (ของพร้อมใช้)
| รายการ | คืออะไร |
|---|---|
| [Sample Prompts](examples/sample-prompts.md) | Prompt สำเร็จรูป copy ไปใช้ได้เลย |
| [Config ตัวอย่าง 6 แบบ](examples/claude_desktop_config/) | claude_desktop_config.json ทุกสถานการณ์ |
| [API Scripts](examples/api-scripts/) | Node (Claude API + MCP) และ Python (VDS ตรง) |
| [Webapp Demo](examples/webapp-demo/) | Chat web app รันได้จริง |

## ⚡ Quick Start (5 นาที)

ถ้าคุณใช้ **Tableau Cloud** และมี Claude แบบ paid plan:

1. เปิด Claude (web หรือ Desktop) → **Settings → Connectors → Add custom connector**
2. ใส่ URL: `https://mcp.tableau.com`
3. Sign in ด้วยบัญชี Tableau Cloud ของคุณ (OAuth)
4. ลองถาม: *"มี data source อะไรใน site ของฉันบ้าง"*

เสร็จแล้ว! 🎉 อ่านรายละเอียดเพิ่มเติมที่ [บท 2.2](02-installation/02-hosted-endpoint.md)

ถ้าคุณใช้ **Tableau Server** (self-hosted) → ไปที่ [บท 2.3](02-installation/03-claude-desktop-npx.md)

## 🔗 ลิงก์ที่เกี่ยวข้อง

- 📦 Official Repo: [tableau/tableau-mcp](https://github.com/tableau/tableau-mcp)
- 📖 Official Docs: [tableau.github.io/tableau-mcp](https://tableau.github.io/tableau-mcp/)
- 📦 npm Package: [@tableau/mcp-server](https://www.npmjs.com/package/@tableau/mcp-server)
- 🤖 Model Context Protocol: [modelcontextprotocol.io](https://modelcontextprotocol.io)

## 📌 เวอร์ชันที่ใช้อ้างอิง

| รายการ | เวอร์ชัน | อัปเดตล่าสุด |
|---|---|---|
| tableau-mcp | v2.2x | ส.ค. 2026 |
| Node.js ขั้นต่ำ | 22.7.5+ | — |
| คู่มือนี้ | 1.0 | ส.ค. 2026 |

> ⚠️ Tableau MCP ออก release ใหม่บ่อยมาก หากพบว่าเนื้อหาไม่ตรงกับเวอร์ชันล่าสุด กรุณาเปิด [Issue](../../issues) แจ้งได้เลย

## 🙋‍♂️ เกี่ยวกับผู้เขียน

**Narit Apisamachan** — Solutions Consultant ด้าน Tableau และ Data Analytics ประสบการณ์ 10+ ปี ทำงานกับลูกค้าองค์กรชั้นนำในประเทศไทย

- 🌐 Facebook Page: อะไรก็ AI
- 📺 YouTube: Tableau MCP Academy

## 📄 License & Copyright

© 2026 Narit Apisamachan (The Narit Lab) — สงวนลิขสิทธิ์

เนื้อหาในคู่มือนี้เผยแพร่ภายใต้สัญญาอนุญาต [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/deed.th)

**คุณสามารถ:** นำไปใช้ แชร์ ดัดแปลง แปล หรืออ้างอิงในงานของคุณได้อย่างอิสระ

**เงื่อนไขเดียว:** ต้องให้เครดิตแหล่งที่มา โดยระบุ **"The Narit Lab"** พร้อมลิงก์กลับมาที่ repo นี้ และระบุด้วยหากมีการดัดแปลงเนื้อหา

ตัวอย่างการให้เครดิต:

> เนื้อหาอ้างอิงจาก [Tableau MCP Guide by The Narit Lab](https://github.com/thenaritlab/tableau-mcp-guide)
