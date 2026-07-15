const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require("@whiskeysockets/baileys");

const http = require("http");
const pino = require("pino");

async function startBot() {
    // تحديد مجلد حفظ الجلسة باسم session
    const { state, saveCreds } = await useMultiFileAuthState("session");

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true, // تفعيل طباعة كود الـ QR في سجلات السيرفر
        logger: pino({ level: "silent" })
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
        if (connection === "open") {
            console.log("✅ تم الاتصال بنجاح وتفعيل البوت بالواتساب!");
        } else if (connection === "close") {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log("❌ تم قطع الاتصال، جاري إعادة المحاولة:", shouldReconnect);
            if (shouldReconnect) {
                startBot();
            }
        }
    });
}

startBot();

// سيرفر بسيط لإبقاء خدمة Render تعمل بدون توقف
http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("WhatsApp Bot is Running Successfully!\n");
}).listen(process.env.PORT || 3000);


