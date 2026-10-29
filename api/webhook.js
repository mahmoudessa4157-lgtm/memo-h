export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("Bot is Live");
  
  try {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const token = url.searchParams.get('token');
    
    if (!token) return res.status(400).send("Token missing");

    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch(e) {}
    }

    // لو مفيش رسالة، بنرد وخلاص
    if (!body || !body.message || !body.message.text) {
      return res.status(200).send("OK");
    }

    const chatId = body.message.chat.id;
    const text = body.message.text;

    // جلب كود البوت من Firebase عن طريق الـ REST API
    const fbRes = await fetch(`https://memo-hosteng-default-rtdb.firebaseio.com/bots/${token}.json`);
    const data = await fbRes.json();
    
    if (!data || !data.code) {
      return res.status(200).send("No code found");
    }

    // تشغيل كودك
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    const botLogic = new AsyncFunction('chatId', 'text', 'token', data.code);
    
    await botLogic(chatId, text, token);
    
    res.status(200).send("OK");
  } catch (e) {
    console.error("Execution Error:", e);
    res.status(200).send("Error occurred but handled");
  }
}
