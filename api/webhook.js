export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("Bot is Live");
  
  const token = req.query.token;
  let body = req.body;
  
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch(e) {}
  }

  if (body && body.message && body.message.text) {
    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chat_id: body.message.chat.id, 
          text: "✅ الاختبار نجح! السكة سليمة وواصلة." 
        })
      });
    } catch (e) {}
  }
  res.status(200).send("OK");
}
