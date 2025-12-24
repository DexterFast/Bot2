const { getJid, getSender, loadDatabase, saveDatabase } = require('../../utils');

module.exports = async (sock, msg, args) => {
    const jid = getJid(msg);
    const sender = getSender(msg);
    
    // Carregar banco de dados de casamentos
    const marriages = loadDatabase('marriages.json');
    
    // Verificar se está casado
    if (!marriages[sender]) {
        return sock.sendMessage(jid, { 
            text: '❌ Você não está casado(a)!' 
        });
    }
    
    const partner = marriages[sender];
    const partnerName = partner.split('@')[0];
    const senderName = sender.split('@')[0];
    
    // Realizar divórcio
    delete marriages[sender];
    delete marriages[partner];
    saveDatabase('marriages.json', marriages);
    
    const message = `💔 *DIVÓRCIO REALIZADO!* 💔

😢 @${senderName} e @${partnerName} se divorciaram!

📋 O casamento foi oficialmente desfeito.
💸 Partilha de bens: 50% para cada um.

👋 Boa sorte para ambos!`;
    
    await sock.sendMessage(jid, {
        text: message,
        mentions: [sender, partner]
    });
};
