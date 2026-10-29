hereexport default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "POST") return res.status(405).end();
  const { token, webhookUrl } = req.body;
  if (!token || !webhookUrl) return res.status(400).json({ ok: false, description: "بيانات ناقصة" });
  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}`);
    const tgData = await tgRes.json();
    res.status(200).json(tgData);
  } catch (e) {
    res.status(500).json({ ok: false, description: "فشل الاتصال بتليجرام" });
  }
}
