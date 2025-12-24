const { getJid, downloadMedia, getQuoted } = require('../../utils');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

module.exports = async (sock, msg, args) => {
    const jid = getJid(msg);
    
    // Verificar se há imagem citada ou na mensagem
    const quoted = getQuoted(msg);
    const hasImage = msg.message?.imageMessage || quoted?.imageMessage;
    
    if (!hasImage) {
        return sock.sendMessage(jid, { 
            text: '❌ Você precisa enviar ou citar uma imagem!\n\nExemplo: Envie uma imagem com legenda !tofig' 
        });
    }
    
    await sock.sendMessage(jid, { text: '🔄 Convertendo para figurinha...' });
    
    try {
        // Baixar a imagem
        const buffer = await downloadMedia(quoted ? { message: quoted } : msg);
        
        if (!buffer) {
            return sock.sendMessage(jid, { text: '❌ Erro ao baixar a imagem.' });
        }
        
        // Converter para WebP (formato de sticker)
        const outputPath = path.join(__dirname, '../../temp', `sticker_${Date.now()}.webp`);
        
        await sharp(buffer)
            .resize(512, 512, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .webp()
            .toFile(outputPath);
        
        // Enviar como sticker
        await sock.sendMessage(jid, {
            sticker: fs.readFileSync(outputPath)
        });
        
        // Limpar arquivo temporário
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }
        
    } catch (error) {
        console.error('Erro ao converter para figurinha:', error);
        await sock.sendMessage(jid, { 
            text: '❌ Erro ao converter a imagem para figurinha.' 
        });
    }
};
