const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require("@whiskeysockets/baileys");

const http = require("http");
const pino = require("pino"); // إضافة مكتبة التسجيل لحل مشكلة الاتصال

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session");

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: "silent" }) // تفعيل الـ logger بشكل صامت لمنع أخطاء السيرفر
    });

    sock.ev.on("creds.update", saveCreds);

    if (!sock.authState.creds.registered) {
        const phoneNumber = "967701770662"; 
        // ننتظر قليلاً حتى يستقر الاتصال قبل طلب كود الاقتران
        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(phoneNumber);
                console.log("رمز الاقتران الخاص بك هو:", code);
            } catch (err) {
                console.log("خطأ أثناء طلب كود الاقتران:", err.message);
            }
        }, 5000);
    }

    sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
        if (connection === "open") {
            console.log("✅ تم الاتصال بالواتساب بنجاح!");
        }
        
        if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log("❌ تم قطع الاتصال، جاري إعادة المحاولة:", shouldReconnect);
            if (shouldReconnect) {
                startBot();
            }
        }
    });
}

// تشغيل البوت
startBot();

// إنشاء خادم ويب بسيط لكي لا يتوقف البوت على Render
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('WhatsApp Bot is running!\n');
}).listen(process.env.PORT || 3000);


