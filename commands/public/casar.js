const { getJid, getMentioned, getSender, loadDatabase, saveDatabase, randomElement, downloadFromUrl } = require('../../utils');
const config = require('../../config');
const path = require('path');

module.exports = async (sock, msg, args) => {
    const jid = getJid(msg);
    const mentioned = getMentioned(msg);
    const sender = getSender(msg);
    
    if (mentioned.length === 0) {
        return sock.sendMessage(jid, { 
            text: '❌ Você precisa marcar alguém para casar!\n\nExemplo: !casar @pessoa' 
        });
    }
    
    const target = mentioned[0];
    
    if (target === sender) {
        return sock.sendMessage(jid, { 
            text: '❌ Você não pode casar consigo mesmo! 😅' 
        });
    }
    
    // Carregar banco de dados de casamentos
    const marriages = loadDatabase('marriages.json');
    
    // Verificar se já está casado
    if (marriages[sender]) {
        return sock.sendMessage(jid, { 
            text: `❌ Você já está casado(a) com @${marriages[sender].split('@')[0]}!\n\nUse *!divorciar* primeiro.`,
            mentions: [marriages[sender]]
        });
    }
    
    if (marriages[target]) {
        return sock.sendMessage(jid, { 
            text: `❌ Esta pessoa já está casada com @${marriages[target].split('@')[0]}!`,
            mentions: [marriages[target]]
        });
    }
    
    // Realizar casamento
    marriages[sender] = target;
    marriages[target] = sender;
    saveDatabase('marriages.json', marriages);
    
    const senderName = sender.split('@')[0];
    const targetName = target.split('@')[0];
    
    const weddingGif = randomElement(config.gifs.casar);
    
    const message = `💒 *CASAMENTO REALIZADO!* 💒

👰 @${senderName}
💍
🤵 @${targetName}

🎉 Parabéns aos noivos! 🎊
💖 Que sejam muito felizes juntos! 💖

🌹 Casados desde: ${new Date().toLocaleDateString('pt-BR')}`;
    
    try {
        const tempPath = path.join(__dirname, '../../temp', `wedding_${Date.now()}.gif`);
        await downloadFromUrl(weddingGif, tempPath);
        
        await sock.sendMessage(jid, {
            video: { url: tempPath },
            gifPlayback: true,
            caption: message,
            mentions: [sender, target]
        });
        
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
