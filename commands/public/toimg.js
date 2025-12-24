const { getJid, downloadMedia, getQuoted } = require('../../utils');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

module.exports = async (sock, msg, args) => {
    const jid = getJid(msg);
    
    // Verificar se há sticker citado ou na mensagem
    const quoted = getQuoted(msg);
    const hasSticker = msg.message?.stickerMessage || quoted?.stickerMessage;
    
    if (!hasSticker) {
        return sock.sendMessage(jid, { 
            text: '❌ Você precisa enviar ou citar uma figurinha!\n\nExemplo: Cite uma figurinha e use !toimg' 
        });
    }
    
    await sock.sendMessage(jid, { text: '🔄 Convertendo para imagem...' });
    
    try {
        // Baixar o sticker
        const buffer = await downloadMedia(quoted ? { message: quoted } : msg);
        
        if (!buffer) {
            return sock.sendMessage(jid, { text: '❌ Erro ao baixar a figurinha.' });
        }
        
        // Converter para PNG
        const outputPath = path.join(__dirname, '../../temp', `image_${Date.now()}.png`);
        
        await sharp(buffer)
            .png()
            .toFile(outputPath);
        
        // Enviar como imagem
        await sock.sendMessage(jid, {
            image: fs.readFileSync(outputPath),
            caption: '✅ Figurinha convertida para imagem!'
        });
        
        // Limpar arquivo temporário
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }
        
    } catch (error) {
        console.error('Erro ao converter para imagem:', error);
        await sock.sendMessage(jid, { 
            text: '❌ Erro ao converter a figurinha para imagem.' 
        });
    }
};
