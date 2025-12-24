const {
    default: makeWASocket,
    DisconnectReason,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    proto
} = require('@whiskeysockets/baileys')

const pino = require('pino');
const qrcode = require('qrcode');
const config = require('./config');
const handler = require('./handler');
const fs = require('fs');



// Criar diretórios necessários
if (!fs.existsSync('./database')) fs.mkdirSync('./database');
if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState(config.sessionName);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state,
        browser: [config.botName, 'Chrome', '1.0.0'],
        getMessage: async (key) => {
            return proto.WebMessageInfo.fromObject({
                key: key,
                message: { conversation: 'Mensagem não encontrada' },
            });
        }
    });

    
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('❌ Conexão fechada. Tentando reconectar:', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            } else {
                console.log('⚠️  Sessão desconectada. Apague a pasta ' + config.sessionName + ' e reinicie.');
            }
        } else if (connection === 'open') {
            console.log('✅ Bot conectado com sucesso!');
            console.log('📱 Nome do Bot:', config.botName);
            console.log('👤 Dono:', config.ownerName);
            console.log('🔧 Prefixo:', config.prefix);
        }

        if (qr) {
            console.log('\n🔐 QR Code gerado. Salvando como imagem...\n');
            qrcode.toDataURL(qr, { scale: 8 }, (err, url) => {
                if (err) return console.error('Erro ao gerar Data URL do QR Code:', err);
                const base64Data = url.replace(/^data:image\/png;base64,/, "");
                fs.writeFileSync('./qrcode.png', base64Data, 'base64');
                console.log('QR Code salvo em qrcode.png');
            });
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message) return;
        if (msg.key.remoteJid === 'status@broadcast') return;
        
        await handler(sock, msg);
    });

    sock.ev.on('group-participants.update', async (update) => {
        // Handler para eventos de grupo (entrada/saída de membros)
        console.log('Evento de grupo:', update);
    });

    return sock;
}

console.log('🤖 Iniciando ' + config.botName + '...\n');
connectToWhatsApp();
