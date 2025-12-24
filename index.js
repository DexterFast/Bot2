const Baileys = require('@whiskeysockets/baileys');
const {
    default: makeWASocket,
    DisconnectReason,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    proto
} = Baileys;

const pino = require('pino');
const config = require('./config');
const handler = require('./handler');
const fs = require('fs');

const makeInMemoryStore = Baileys.makeInMemoryStore || Baileys.default?.makeInMemoryStore;
const store = makeInMemoryStore ? makeInMemoryStore({
    logger: pino().child({ level: 'silent', stream: 'store' })
}) : null;

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState(config.sessionName);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        auth: state,
        // Forçamos um navegador reconhecido para liberar o Pair Code
        browser: ["Ubuntu", "Chrome", "110.0.5481.178"], 
        printQRInTerminal: false,
        getMessage: async (key) => {
            return { conversation: 'F!NX Bot online' };
        }
    });

    // --- LÓGICA DE PAREAMENTO AUTOMÁTICO PARA RENDER ---
    if (!sock.authState.creds.registered) {
        // Pega o número diretamente do seu config.js
        // IMPORTANTE: O número deve ter 55 + DDD + Numero (ex: 5511999998888)
        let phoneNumber = config.ownerNumber.replace(/[^0-9]/g, '');

        console.log('\n' + '═'.repeat(40));
        console.log(`🔗 SOLICITANDO CÓDIGO PARA: ${phoneNumber}`);
        console.log('═'.repeat(40));

        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(phoneNumber);
                console.log('\n' + '╔════════════════════════════════════╗');
                console.log(`║  SEU CÓDIGO:   ${code}        ║`);
                console.log('╚════════════════════════════════════╝');
                console.log('\nCOMO CONECTAR:');
                console.log('1. No WhatsApp, vá em Aparelhos Conectados');
                console.log('2. Clique em Conectar um aparelho');
                console.log('3. Clique em "Conectar com número de telefone"');
                console.log('4. Digite o código acima.\n');
            } catch (err) {
                console.error('Erro ao gerar código de pareamento:', err);
            }
        }, 5000); // Espera 5 segundos para garantir que o socket está pronto
    }
    // ---------------------------------------------------

    if (store) store.bind(sock.ev);
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) connectToWhatsApp();
        } else if (connection === 'open') {
            console.log('\n✅ F!NX BOT CONECTADO E PRONTO!');
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;
        await handler(sock, msg);
    });

    return sock;
}

console.log('🤖 Iniciando ' + config.botName + '...');
connectToWhatsApp().catch(err => console.error("Erro fatal:", err));
