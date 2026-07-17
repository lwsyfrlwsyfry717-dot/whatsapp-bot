const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const http = require("http");

const PHONE_NUMBER = "967701770662"; // ضع رقمك بدون +

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("session");

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" })
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "open") {
      console.log("✅ تم الاتصال بواتساب بنجاح!");
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;

      console.log("❌ انقطع الاتصال");

      if (shouldReconnect) {
        console.log("🔄 إعادة الاتصال...");
        startBot();
      }
    }
  });

  if (!state.creds.registered) {
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(PHONE_NUMBER);

        console.log("================================");
        console.log("رمز الاقتران:");
        console.log(code);
        console.log("================================");
      } catch (err) {
        console.error("فشل الحصول على رمز الاقتران:");
        console.error(err);
      }
    }, 5000);
  }
}

startBot();

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WhatsApp Bot is Running");
}).listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

