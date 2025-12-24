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
            text: '❌ Você precisa marcar alguém para rebaixar!\n\nExemplo: !rebaixar @pessoa' 
        });
    }
    
    // Verificar se o bot é admin
    if (!await isBotAdmin(sock, msg)) {
        return sock.sendMessage(jid, { 
            text: '❌ Eu preciso ser administrador para rebaixar membros!' 
        });
    }
    
    try {
        // Rebaixar de admin
        await sock.groupParticipantsUpdate(jid, mentioned, 'demote');
        
        await sock.sendMessage(jid, { 
            text: `📉 Membro(s) rebaixado(s) de administrador com sucesso!`,
            mentions: mentioned
        });
    } catch (error) {
        console.error('Erro ao rebaixar membro:', error);
        await sock.sendMessage(jid, { 
            text: '❌ Erro ao rebaixar membro. Verifique se tenho permissão.' 
        });
    }
};
