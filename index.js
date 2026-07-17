const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const http = require("http");
const qrcode = require("qrcode-terminal");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("session");

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, qr, lastDisconnect }) => {

    if (qr) {
      console.log("📱 امسح رمز QR التالي:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("✅ تم الاتصال بواتساب بنجاح!");
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;

      console.log("❌ انقطع الاتصال");

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
  res.end("WhatsApp Bot is Running");
}).listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

