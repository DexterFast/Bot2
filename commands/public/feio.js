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
    
    // Calcular nível de feiura (0-100%)
    const uglyLevel = Math.floor(Math.random() * 101);
    
    let emoji = '';
    let message = '';
    
    if (uglyLevel >= 90) {
        emoji = '🤢🤢🤢';
        message = 'ALERTA MÁXIMO! Nem o espelho aguenta! 🪞💥';
    } else if (uglyLevel >= 70) {
        emoji = '🤢🤢';
        message = 'Bem feinho(a)! Melhor usar máscara! 😷';
    } else if (uglyLevel >= 50) {
        emoji = '🤢';
        message = 'Feio(a) na média! Nada que uma maquiagem não resolva! 💄';
    } else if (uglyLevel >= 30) {
        emoji = '😐';
        message = 'Mais ou menos... Depende da luz! 💡';
    } else {
        emoji = '😍';
        message = 'Lindíssimo(a)! Uma obra de arte! 🎨';
    }
    
    const feioGif = randomElement(config.gifs.feio);
    
    const text = `🤢 *FEIÔMETRO* 🤢

👤 @${targetName}

😱 *Nível de Feiura: ${uglyLevel}%* 😱

${emoji} ${message}`;
    
    try {
        const tempPath = path.join(__dirname, '../../temp', `feio_${Date.now()}.gif`);
        await downloadFromUrl(feioGif, tempPath);
        
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
