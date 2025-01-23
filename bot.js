import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import axios from 'axios';

// تنظیمات Gemini API
const API_KEY = "AIzaSyCQNF4Wt3rNpg_wCRb8g05uJdK61O6bk6E"; // کلید API خود را قرار دهید
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

// تنظیمات کلاینت واتس‌اپ
const client = new Client({
    authStrategy: new LocalAuth({ dataPath: 'session_data' }), // ذخیره session برای جلوگیری از اسکن QR در هر بار اجرا
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true, // اجرای مرورگر در حالت headless
    }
});

// Event QR Code
client.on('qr', (qr) => {
    console.log('QR code دریافت شد، لطفاً اسکن کنید:');
    qrcode.generate(qr, { small: true }); // نمایش QR Code در ترمینال
});

// Event آماده‌سازی کلاینت
client.on('ready', () => {
    console.log('کلاینت آماده است!');
});

// Event دریافت پیام
client.on('message', async (msg) => {
    const sender = msg.from;
    const messageText = msg.body;

    // اگر پیام از طرف خودتان باشد، پاسخ ندهید
    if (msg.fromMe) return;

    // ارسال پیام به Gemini و دریافت پاسخ
    try {
        const response = await getGeminiResponse(messageText);
        await msg.reply(response); // ارسال پاسخ به کاربر
    } catch (error) {
        console.error('خطا در ارسال پیام به Gemini:', error);
        await msg.reply('متأسفم، مشکلی در پردازش پیام شما پیش آمد.');
    }
});

// تابع برای ارسال پیام به Gemini و دریافت پاسخ
async function getGeminiResponse(prompt) {
    const headers = {
        "Content-Type": "application/json"
    };
    const data = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }]
    };

    const response = await axios.post(API_URL, data, { headers });
    if (response.status === 200) {
        return response.data.candidates[0].content.parts[0].text;
    } else {
        throw new Error('خطا در دریافت پاسخ از Gemini');
    }
}

// شروع کلاینت
client.initialize();
