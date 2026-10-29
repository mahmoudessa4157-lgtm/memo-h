export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "POST") return res.status(405).json({ ok: false, description: "Method not allowed" });
  
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch(e) {}
  }
  
  const { token, webhookUrl } = body || {};
  if (!token || !webhookUrl) return res.status(400).json({ ok: false, description: "بيانات ناقصة" });

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}`);
    const text = await tgRes.text();
    let tgData;
    try {
      tgData = JSON.parse(text);
    } catch(e) {
      return res.status(500).json({ ok: false, description: "تليجرام رجّع رد غير مفهوم", raw: text });
    }
    res.status(200).json(tgData);
  } catch (e) {
    res.status(500).json({ ok: false, description: "فشل الاتصال بتليجرام", error: e.message });
  }
}
