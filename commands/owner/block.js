const { getJid, getMentioned } = require('../../utils');

module.exports = async (sock, msg, args) => {
    const jid = getJid(msg);
    const mentioned = getMentioned(msg);
    
    if (mentioned.length === 0) {
        return sock.sendMessage(jid, { 
            text: '❌ Você precisa marcar alguém para bloquear!\n\nExemplo: !block @pessoa' 
        });
    }
    
    try {
        for (const user of mentioned) {
            await sock.updateBlockStatus(user, 'block');
        }
        
        await sock.sendMessage(jid, { 
            text: `🚫 Usuário(s) bloqueado(s) com sucesso!`,
            mentions: mentioned
        });
    } catch (error) {
        console.error('Erro ao bloquear usuário:', error);
        await sock.sendMessage(jid, { 
            text: '❌ Erro ao bloquear usuário.' 
        });
    }
};
