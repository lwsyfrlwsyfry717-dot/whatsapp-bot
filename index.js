const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const http = require("http");
const pino = require("pino");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("session");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: pino({ level: "silent" })
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "open") {
      console.log("✅ تم الاتصال بنجاح وتفعيل البوت بالواتساب!");
    } else if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect?.error)?.output?.statusCode !==
        DisconnectReason.loggedOut;

      console.log("❌ تم قطع الاتصال، جاري إعادة المحاولة:", shouldReconnect);

      if (shouldReconnect) {
        startBot();
      }
    }
  });
}

startBot();

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WhatsApp Bot is Running Successfully!\n");
}).listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

