const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const http = require("http");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("session");

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: true
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, qr, lastDisconnect }) => {
    if (qr) {
      console.log("📱 امسح رمز QR الذي يظهر في السجل.");
    }

    if (connection === "open") {
      console.log("✅ تم الاتصال بواتساب بنجاح!");
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;

      if (shouldReconnect) {
        startBot();
      }
    }
  });
}

startBot();

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.end("WhatsApp Bot is Running");
}).listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

