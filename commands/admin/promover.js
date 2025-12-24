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
            text: '❌ Você precisa marcar alguém para promover!\n\nExemplo: !promover @pessoa' 
        });
    }
    
    // Verificar se o bot é admin
    if (!await isBotAdmin(sock, msg)) {
        return sock.sendMessage(jid, { 
            text: '❌ Eu preciso ser administrador para promover membros!' 
        });
    }
    
    try {
        // Promover a admin
        await sock.groupParticipantsUpdate(jid, mentioned, 'promote');
        
        await sock.sendMessage(jid, { 
            text: `👑 Membro(s) promovido(s) a administrador com sucesso! 🎉`,
            mentions: mentioned
        });
    } catch (error) {
        console.error('Erro ao promover membro:', error);
        await sock.sendMessage(jid, { 
            text: '❌ Erro ao promover membro. Verifique se tenho permissão.' 
        });
    }
};
