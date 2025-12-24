const { getJid, getMentioned, getSender, isGroup, loadDatabase } = require('../../utils');

module.exports = async (sock, msg, args) => {
    const jid = getJid(msg);
    
    if (!isGroup(msg)) {
        return sock.sendMessage(jid, { 
            text: '❌ Este comando só funciona em grupos!' 
        });
    }
    
    const mentioned = getMentioned(msg);
    const target = mentioned.length > 0 ? mentioned[0] : getSender(msg);
    
    // Carregar avisos
    const warns = loadDatabase('warns.json');
    
    if (!warns[jid] || !warns[jid][target] || warns[jid][target].length === 0) {
        return sock.sendMessage(jid, { 
            text: `✅ @${target.split('@')[0]} não possui avisos!`,
            mentions: [target]
        });
    }
    
    const userWarns = warns[jid][target];
    let message = `⚠️ *AVISOS DE @${target.split('@')[0]}* ⚠️\n\n`;
    message += `📊 Total: ${userWarns.length}/3\n\n`;
    
    userWarns.forEach((warn, index) => {
        const date = new Date(warn.date).toLocaleString('pt-BR');
        message += `${index + 1}. ${warn.reason}\n   📅 ${date}\n\n`;
    });
    
    await sock.sendMessage(jid, {
        text: message,
        mentions: [target]
    });
};
