const { getJid, getMentioned, getSender, randomElement, downloadFromUrl } = require('../../utils');
const config = require('../../config');
const path = require('path');

module.exports = async (sock, msg, args) => {
    const jid = getJid(msg);
    const mentioned = getMentioned(msg);
    const sender = getSender(msg);
    
    if (mentioned.length === 0) {
        return sock.sendMessage(jid, { 
            text: '❌ Você precisa marcar alguém para dar um fatality!\n\nExemplo: !kill @pessoa' 
        });
    }
    
    const target = mentioned[0];
    const targetName = target.split('@')[0];
    const senderName = sender.split('@')[0];
    
    // Escolher GIF aleatório de kill
    const killGif = randomElement(config.gifs.kill);
    
    // Mensagens variadas de fatality
    const messages = [
        `💀 *FATALITY!*\n\n@${senderName} executou um fatality brutal em @${targetName}! 🔥`,
        `⚔️ *FINISH HIM!*\n\n@${targetName} foi eliminado por @${senderName}! 💥`,
        `🩸 *FLAWLESS VICTORY!*\n\n@${senderName} destruiu @${targetName} sem piedade! 💀`,
        `🔪 *BRUTALITY!*\n\n@${targetName} não teve chance contra @${senderName}! ⚡`
    ];
    
    const message = randomElement(messages);
    
    try {
        // Baixar GIF
        const tempPath = path.join(__dirname, '../../temp', `kill_${Date.now()}.gif`);
        await downloadFromUrl(killGif, tempPath);
        
        // Enviar GIF com legenda
        await sock.sendMessage(jid, {
            video: { url: tempPath },
            gifPlayback: true,
            caption: message,
            mentions: [sender, target]
        });
        
        // Limpar arquivo temporário
        const fs = require('fs');
        if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
        }
    } catch (error) {
        console.error('Erro ao enviar GIF:', error);
        await sock.sendMessage(jid, { 
            text: message,
            mentions: [sender, target]
        });
    }
};
