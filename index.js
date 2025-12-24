const {
    default: makeWASocket,
    DisconnectReason,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    proto,
    makeInMemoryStore
} = require('@whiskeysockets/baileys');

const pino = require('pino');
const qrcode = require('qrcode-terminal'); // Para o QR aparecer no log
const config = require('./config');
const handler = require('./handler');
const fs = require('fs');

// Configuração de Memória (Store)
const store = makeInMemoryStore({ 
    logger: pino().child({ level: 'silent', stream: 'store' }) 
});

// Criar diretórios necessários
if (!fs.existsSync('./database')) fs.mkdirSync('./database');
if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState(config.sessionName);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false, // Deixamos false para customizar a exibição
        auth: state,
        browser: [config.botName, 'Chrome', '1.0.0'],
        getMessage: async (key) => {
            return (store.loadMessage(key.remoteJid, key.id) || proto.WebMessageInfo.fromObject({
                key: key,
                message: { conversation: 'Mensagem não encontrada' },
            }));
        }
    });

    // Vincula a memória ao socket
    store.bind(sock.ev);
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
            console.log('\n--- 🚀 STATUS DO BOT ---');
            console.log('✅ Conectado com sucesso!');
            console.log('📱 Nome:', config.botName);
            console.log('👤 Dono:', config.ownerName);
            console.log('🔧 Prefixo:', config.prefix);
            console.log('------------------------\n');
        }

        if (qr) {
            console.log('\n🔐 [QR CODE] ESCANEIE ABAIXO PARA CONECTAR:');
            // 'small: true' faz o QR Code caber perfeitamente nos logs do Render
            qrcode.generate(qr, { small: true });
            console.log('Dica: Se o QR Code parecer quebrado, diminua o zoom do navegador.\n');
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;
        
        store.upsertMessage(msg);
        await handler(sock, msg);
    });

    return sock;
}

console.log('🤖 Iniciando ' + config.botName + '...');
connectToWhatsApp().catch(err => console.error("Erro ao iniciar bot:", err));
