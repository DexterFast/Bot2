const Baileys = require('@whiskeysockets/baileys');
const {
    default: makeWASocket,
    DisconnectReason,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    proto
} = Baileys;

const pino = require('pino');
const qrcode = require('qrcode-terminal');
const config = require('./config');
const handler = require('./handler');
const fs = require('fs');

// CORREÇÃO CRÍTICA: Tenta pegar a função de dois lugares diferentes
const makeInMemoryStore = Baileys.makeInMemoryStore || Baileys.default?.makeInMemoryStore;

// Configuração de Memória (Store)
const store = makeInMemoryStore ? makeInMemoryStore({ 
    logger: pino().child({ level: 'silent', stream: 'store' }) 
}) : null;

// Criar diretórios necessários
if (!fs.existsSync('./database')) fs.mkdirSync('./database');
if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState(config.sessionName);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: state,
        browser: [config.botName, 'Chrome', '1.0.0'],
        getMessage: async (key) => {
            if (store) {
                return (await store.loadMessage(key.remoteJid, key.id))?.message || undefined;
            }
            return proto.WebMessageInfo.fromObject({
                key: key,
                message: { conversation: 'Mensagem não encontrada' },
            });
        }
    });

    if (store) store.bind(sock.ev);
    
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('❌ Conexão fechada. Tentando reconectar:', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            } else {
                console.log('⚠️ Sessão desconectada. Apague a pasta ' + config.sessionName + ' e reinicie.');
            }
        } else if (connection === 'open') {
            console.log('\n' + '='.repeat(30));
            console.log('🚀 BOT CONECTADO COM SUCESSO');
            console.log(`📱 Nome: ${config.botName}`);
            console.log(`👤 Dono: ${config.ownerName}`);
            console.log('='.repeat(30) + '\n');
        }

        if (qr) {
            console.log('\n🔐 ESCANEIE O QR CODE ABAIXO:');
            qrcode.generate(qr, { small: true });
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
