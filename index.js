const Baileys = require('@whiskeysockets/baileys');
const {
    default: makeWASocket,
    DisconnectReason,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    proto
} = Baileys;

const pino = require('pino');
const readline = require('readline');
const config = require('./config');
const handler = require('./handler');
const fs = require('fs');

// Interface para digitar o número no terminal
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

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
        browser: ["Ubuntu", "Chrome", "20.0.04"], // Importante para o código de pareamento
        printQRInTerminal: false,
        getMessage: async (key) => {
            if (store) {
                return (await store.loadMessage(key.remoteJid, key.id))?.message || undefined;
            }
            return { conversation: 'Mensagem não encontrada' };
        }
    });

    // --- LÓGICA DE PAREAMENTO POR CÓDIGO ---
    if (!sock.authState.creds.registered) {
        console.log('\n' + '='.repeat(40));
        console.log('🔗 MODO DE PAREAMENTO POR CÓDIGO');
        console.log('='.repeat(40));
        
        const phoneNumber = await question('\nDigite o número do bot (Ex: 5511988887777):\n> ');
        const code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
        
        console.log('\n' + '─'.repeat(40));
        console.log(`✅ SEU CÓDIGO: ${code}`);
        console.log('─'.repeat(40));
        console.log('Instruções:');
        console.log('1. Abra o WhatsApp > Aparelhos Conectados');
        console.log('2. Clique em Conectar um aparelho');
        console.log('3. Escolha "Conectar com número de telefone"\n');
    }
    // ---------------------------------------

    if (store) store.bind(sock.ev);
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) connectToWhatsApp();
        } else if (connection === 'open') {
            console.log('\n🚀 BOT CONECTADO COM SUCESSO!');
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;
        if (store) store.upsertMessage(msg.key.remoteJid, msg);
        await handler(sock, msg);
    });

    return sock;
}

console.log('🤖 Iniciando ' + config.botName + '...');
connectToWhatsApp().catch(err => console.error("Erro fatal:", err));
