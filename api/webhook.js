import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";

// إعدادات Firebase بتاعتك
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
  // الرد على تليجرام لو جاله طلب GET (للتأكد إن البوت شغال)
  if (req.method !== "POST") return res.status(200).send("Bot is Live");
  
  // سحب التوكن من الرابط
  const urlParams = new URLSearchParams(req.url.split('?')[1]);
  const token = urlParams.get('token');
  if (!token) return res.status(400).send("Token missing");

  let body = req.body;
  // تحويل البيانات لو جت كنص (عشان نمنع مشكلة الـ Unexpected token)
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch(e) {}
  }

  // التأكد إن فيه رسالة جاية من تليجرام
  if (!body || !body.message || !body.message.text) return res.status(200).send("OK");

  const chatId = body.message.chat.id;
  const text = body.message.text;

  try {
    // سحب كود البوت من Firebase
    const snapshot = await get(ref(db, 'bots/' + token));
    if (!snapshot.exists()) return res.status(404).send("Bot not found");
    
    const userCode = snapshot.val().code;
    
    // السطرين دول هما التعديل بتاعنا عشان الـ await يشتغل
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    const botLogic = new AsyncFunction('chatId', 'text', 'token', userCode);
    
    // تشغيل كود البوت
    await botLogic(chatId, text, token);
    
    res.status(200).send("OK");
  } catch (e) {
    console.error("Error executing bot code:", e);
    res.status(500).send("Error");
  }
}
