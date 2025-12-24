const { getJid, getMentioned, getSender, randomElement, downloadFromUrl } = require('../../utils');
const config = require('../../config');
const path = require('path');

module.exports = async (sock, msg, args) => {
    const jid = getJid(msg);
    const mentioned = getMentioned(msg);
    const sender = getSender(msg);
    
    let target = sender;
    let targetName = sender.split('@')[0];
    
    // Se mencionou alguém, usar essa pessoa
    if (mentioned.length > 0) {
        target = mentioned[0];
        targetName = target.split('@')[0];
    }
    
    // Calcular nível de corno (0-100%)
    const cornoLevel = Math.floor(Math.random() * 101);
    
    let emoji = '';
    let message = '';
    
    if (cornoLevel >= 90) {
        emoji = '🤡🤡🤡';
        message = 'CORNO MASTER SUPREMO! O chifre já chegou na lua! 🌙';
    } else if (cornoLevel >= 70) {
        emoji = '🤡🤡';
        message = 'Corno profissional! Já tem experiência! 😂';
    } else if (cornoLevel >= 50) {
        emoji = '🤡';
        message = 'Corno intermediário! Cuidado com os chifres! 🦌';
    } else if (cornoLevel >= 30) {
        emoji = '😅';
        message = 'Corno iniciante! Ainda tem salvação! 🙏';
    } else {
        emoji = '😇';
        message = 'Praticamente livre de chifres! Parabéns! 🎉';
    }
    
    const cornoGif = randomElement(config.gifs.corno);
    
    const text = `🤡 *CORNÔMETRO* 🤡

👤 @${targetName}

🦌 *Nível de Corno: ${cornoLevel}%* 🦌

${emoji} ${message}`;
    
    try {
        const tempPath = path.join(__dirname, '../../temp', `corno_${Date.now()}.gif`);
        await downloadFromUrl(cornoGif, tempPath);
        
        await sock.sendMessage(jid, {
            video: { url: tempPath },
            gifPlayback: true,
            caption: text,
            mentions: [target]
        });
        
        const fs = require('fs');
        if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
        }
    } catch (error) {
        console.error('Erro ao enviar GIF:', error);
        await sock.sendMessage(jid, { 
            text: text,
            mentions: [target]
        });
    }
};
