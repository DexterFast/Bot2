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

// Ajuste para garantir que a função exista
const makeInMemoryStore = Baileys.makeInMemoryStore || Baileys.default?.makeInMemoryStore;
const store = makeInMemoryStore ? makeInMemoryStore({ logger: pino({ level: 'silent' }) }) : null;

async function connectToWhatsApp() {
    // Carrega a sessão (pasta definida no config.js)
    const { state, saveCreds } = await useMultiFileAuthState(config.sessionName);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        auth: state,
        // Identificação como Chrome no Linux (mais aceita pelo WhatsApp)
        browser: ["Ubuntu", "Chrome", "110.0.5481.178"], 
        printQRInTerminal: false,
        getMessage: async (key) => {
            return { conversation: 'F!NX Bot' };
        }
    });

    // --- LÓGICA DE PAREAMENTO POR CÓDIGO (AUTOMÁTICO) ---
    if (!sock.authState.creds.registered) {
        // Pega o número do dono no config.js e remove qualquer símbolo
        let phoneNumber = config.ownerNumber.replace(/[^0-9]/g, '');

        if (!phoneNumber) {
            console.log('❌ ERRO: Configure o ownerNumber no config.js com seu número (ex: 55119...)');
        } else {
            console.log('\n' + '═'.repeat(40));
            console.log(`📡 SOLICITANDO CÓDIGO PARA: ${phoneNumber}`);
            console.log('═'.repeat(40));

            // Pequeno delay para o socket carregar antes de pedir o código
            setTimeout(async () => {
                try {
                    const code = await sock.requestPairingCode(phoneNumber);
                    console.log('\n' + '╔════════════════════════════════════╗');
                    console.log(`║  CÓDIGO DE PAREAMENTO: ${code}    ║`);
                    console.log('╚════════════════════════════════════╝');
                    console.log('\nNO SEU WHATSAPP:');
                    console.log('1. Aparelhos Conectados > Conectar um aparelho');
                    console.log('2. Clique em "Conectar com número de telefone"');
                    console.log('3. Digite o código acima.\n');
                } catch (err) {
                    console.error('❌ Erro ao pedir código de pareamento:', err);
                }
            }, 5000); 
        }
    }

    if (store) store.bind(sock.ev);
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) connectToWhatsApp();
        } else if (connection === 'open') {
            console.log('\n✅ F!NX BOT CONECTADO COM SUCESSO!');
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
