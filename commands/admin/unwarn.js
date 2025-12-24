const { getJid, getMentioned, isGroup, loadDatabase, saveDatabase } = require('../../utils');

module.exports = async (sock, msg, args) => {
    const jid = getJid(msg);
    
    if (!isGroup(msg)) {
        return sock.sendMessage(jid, { 
            text: '❌ Este comando só funciona em grupos!' 
        });
    }
    
    const mentioned = getMentioned(msg);
    
    if (mentioned.length === 0) {
        return sock.sendMessage(jid, { 
            text: '❌ Você precisa marcar alguém para remover aviso!\n\nExemplo: !unwarn @pessoa' 
        });
    }
    
    const target = mentioned[0];
    
    // Carregar avisos
    const warns = loadDatabase('warns.json');
    
    if (!warns[jid] || !warns[jid][target] || warns[jid][target].length === 0) {
        return sock.sendMessage(jid, { 
            text: '❌ Este usuário não possui avisos!',
            mentions: [target]
        });
    }
    
    // Remover último aviso
    warns[jid][target].pop();
    saveDatabase('warns.json', warns);
    
    const remainingWarns = warns[jid][target].length;
    
    await sock.sendMessage(jid, {
        text: `✅ Um aviso foi removido de @${target.split('@')[0]}!\n\n📊 Avisos restantes: ${remainingWarns}/3`,
        mentions: [target]
    });
};
