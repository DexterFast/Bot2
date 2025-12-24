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
        // O Render exige um User-Agent de navegador real para pareamento
        browser: ["Ubuntu", "Chrome", "110.0.5481.178"], 
        printQRInTerminal: false,
        getMessage: async (key) => {
            return { conversation: 'Mensagem não encontrada' };
        }
    });

    // --- PAREAMENTO AUTOMÁTICO (SEM PERGUNTA) ---
    // Se não houver sessão salva, ele gera o código para o número do dono
    if (!sock.authState.creds.registered) {
        // Pega o número do dono do arquivo config.js
        // Certifique-se que no config.js o ownerNumber tenha o 55...
        let phoneNumber = config.ownerNumber.replace(/[^0-9]/g, '');
        
        if (!phoneNumber) {
            console.error("❌ ERRO: O número do dono (ownerNumber) não foi configurado no config.js");
            process.exit(1);
        }

        console.log('\n' + '='.repeat(40));
        console.log(`🔗 GERANDO CÓDIGO PARA: ${phoneNumber}`);
        console.log('='.repeat(40));
        
        // Aguarda 3 segundos para o socket estabilizar antes de pedir o código
        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(phoneNumber);
                console.log('\n' + '─'.repeat(40));
                console.log(`👉 SEU CÓDIGO DE PAREAMENTO: ${code}`);
                console.log('─'.repeat(40));
                console.log('1. Abra o WhatsApp > Aparelhos Conectados');
                console.log('2. Clique em "Conectar com número de telefone"');
                console.log('3. Digite o código acima.\n');
            } catch (error) {
                console.error("Erro ao solicitar código:", error);
            }
        }, 3000);
    }
    // --------------------------------------------

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
