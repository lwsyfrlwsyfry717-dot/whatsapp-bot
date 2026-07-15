const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const http = require("http");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("session");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  });

  sock.ev.on("creds.update", saveCreds);

  if (!sock.authState.creds.registered) {
    const phoneNumber = "967701770662"; // ضع رقمك هنا مع مفتاح الدولة
    const code = await sock.requestPairingCode(phoneNumber);
    console.log("رمز الاقتران:", code);
  }

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "open") {
      console.log("✅ تم الاتصال بواتساب");
    }

    if (
     


