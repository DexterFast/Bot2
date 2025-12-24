const { getJid, randomElement } = require('../../utils');

module.exports = async (sock, msg, args) => {
    const jid = getJid(msg);
    
    if (args.length === 0) {
        return sock.sendMessage(jid, { 
            text: '❌ Você precisa fornecer opções!\n\nExemplo: !escolher pizza hamburguer sushi' 
        });
    }
    
    const choice = randomElement(args);
    
    await sock.sendMessage(jid, { 
        text: `🤔 *Escolha do Bot:*\n\n✅ *${choice}*` 
    });
};
