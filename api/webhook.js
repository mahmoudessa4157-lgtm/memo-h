import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDGabYD9eTmgKzegk_oRJfj6R6Y8ogk2vc",
  authDomain: "memo-hosteng.firebaseapp.com",
  databaseURL: "https://memo-hosteng-default-rtdb.firebaseio.com",
  projectId: "memo-hosteng",
  storageBucket: "memo-hosteng.firebasestorage.app",
  messagingSenderId: "76655832366",
  appId: "1:76655832366:web:2814584d7d574fbdd21ebf",
  measurementId: "G-95YT9YFV13"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default async function handler(req, res) {
  console.log("🔔 Webhook triggered!");
  
  if (req.method !== "POST") return res.status(200).send("Bot is Live");
  
  const urlParams = new URLSearchParams(req.url.split('?')[1]);
  const token = urlParams.get('token');
  if (!token) return res.status(400).send("Token missing");

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch(e) {}
  }

  if (!body || !body.message || !body.message.text) {
    console.log("⚠️ No text message received");
    return res.status(200).send("OK");
  }

  const chatId = body.message.chat.id;
  const text = body.message.text;

  try {
    console.log("🔍 Fetching bot code from Firebase for token:", token.substring(0, 10) + "...");
    const snapshot = await get(ref(db, 'bots/' + token));
    
    if (!snapshot.exists()) {
      console.log("❌ Bot code not found in Firebase!");
      return res.status(404).send("Bot not found");
    }
    
    const userCode = snapshot.val().code;
    console.log("✅ Code found. Executing...");
    
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    const botLogic = new AsyncFunction('chatId', 'text', 'token', userCode);
    
    await botLogic(chatId, text, token);
    
    console.log("✨ Bot logic executed successfully");
    res.status(200).send("OK");
  } catch (e) {
    console.error("❌ CRITICAL ERROR:", e.message);
    
    // بنبعت الإيرور لتليجرام عشان تشوفه بنفسك
    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: `🛑 خطأ في تشغيل الكود:\n${e.message}` })
      });
    } catch (err) {}
    
    res.status(500).send("Error");
  }
}
