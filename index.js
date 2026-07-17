const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const http = require("http");

const PHONE_NUMBER = "967701770662"; // ضع رقمك مع مفتاح الدولة بدون +

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("session");

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" })
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
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

  if (!sock.authState.creds.registered) {
    const code = await sock.requestPairingCode(PHONE_NUMBER);
    console.log("==================================");
    console.log("رمز الاقتران:");
    console.log(code);
    console.log("==================================");
  }
}

startBot();

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.end("WhatsApp Bot is Running");
}).listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

