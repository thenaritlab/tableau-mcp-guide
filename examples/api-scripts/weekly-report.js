/**
 * weekly-report.js — รายงานยอดขายรายสัปดาห์อัตโนมัติ
 * Claude API + Tableau MCP (MCP connector) → สรุปภาษาไทย → console/ส่งต่อ
 *
 * ใช้กับ: บท 5.2 | รันด้วย cron ทุกเย็นวันศุกร์
 * เตรียม: npm install @anthropic-ai/sdk
 * env:    ANTHROPIC_API_KEY, TABLEAU_MCP_URL (HTTP endpoint จากบท 2.5), MCP_AUTH_TOKEN (ถ้ามี)
 *
 * หมายเหตุ: ฟีเจอร์ MCP connector ยังเป็น beta — เช็ค header/พารามิเตอร์ล่าสุด
 * ที่ docs.claude.com ก่อนใช้จริง
 */
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PROMPT = `
ทำรายงานยอดขายสัปดาห์ล่าสุด (จันทร์-อาทิตย์ที่ผ่านมา) จาก data source "Superstore":
1. ยอดรวม + เทียบสัปดาห์ก่อนหน้า (%)
2. Top 5 สินค้า และ Bottom 3
3. มิติที่เปลี่ยนแปลงผิดปกติ (เบี่ยงเกิน 20% จากค่าเฉลี่ย 4 สัปดาห์)
4. สรุปผู้บริหาร 3 bullet ภาษาไทย
ทุก query ใส่ limit ไม่เกิน 100 แถว
`;

async function main() {
  const res = await client.beta.messages.create(
    {
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      messages: [{ role: "user", content: PROMPT }],
      mcp_servers: [
        {
          type: "url",
          url: process.env.TABLEAU_MCP_URL,
          name: "tableau",
          ...(process.env.MCP_AUTH_TOKEN && {
            authorization_token: process.env.MCP_AUTH_TOKEN,
          }),
        },
      ],
    },
    { headers: { "anthropic-beta": "mcp-client-2025-04-07" } }
  );

  // audit: AI query อะไรบ้าง
  const audit = res.content
    .filter((b) => b.type === "mcp_tool_use")
    .map((b) => ({ tool: b.name, input: b.input }));
  console.error("AUDIT:", JSON.stringify(audit, null, 2));

  // รายงานสุดท้าย
  const report = res.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  console.log(report);
  // TODO: ส่งต่อ — LINE Messaging API / nodemailer / เขียนไฟล์
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
