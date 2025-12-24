const { getJid, getMentioned, isGroup, isBotAdmin } = require('../../utils');

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
            text: '❌ Você precisa marcar alguém para remover!\n\nExemplo: !kick @pessoa' 
        });
    }
    
    // Verificar se o bot é admin
    if (!await isBotAdmin(sock, msg)) {
        return sock.sendMessage(jid, { 
            text: '❌ Eu preciso ser administrador para remover membros!' 
        });
    }
    
    try {
        // Remover os membros mencionados
        await sock.groupParticipantsUpdate(jid, mentioned, 'remove');
        
        await sock.sendMessage(jid, { 
            text: `✅ Membro(s) removido(s) com sucesso! 👋`,
            mentions: mentioned
        });
    } catch (error) {
        console.error('Erro ao remover membro:', error);
        await sock.sendMessage(jid, { 
            text: '❌ Erro ao remover membro. Verifique se tenho permissão.' 
        });
    }
};
