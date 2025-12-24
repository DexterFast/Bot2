const { getJid, getMentioned, isGroup, isBotAdmin, loadDatabase, saveDatabase } = require('../../utils');

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
            text: '❌ Você precisa marcar alguém para banir!\n\nExemplo: !ban @pessoa' 
        });
    }
    
    // Verificar se o bot é admin
    if (!await isBotAdmin(sock, msg)) {
        return sock.sendMessage(jid, { 
            text: '❌ Eu preciso ser administrador para banir membros!' 
        });
    }
    
    try {
        // Carregar lista de banidos
        const bans = loadDatabase('bans.json');
        if (!bans[jid]) bans[jid] = [];
        
        // Adicionar à lista de banidos
        mentioned.forEach(user => {
            if (!bans[jid].includes(user)) {
                bans[jid].push(user);
            }
        });
        
        saveDatabase('bans.json', bans);
        
        // Remover do grupo
        await sock.groupParticipantsUpdate(jid, mentioned, 'remove');
        
        await sock.sendMessage(jid, { 
            text: `🚫 Membro(s) banido(s) com sucesso!\n\n⚠️ Se tentarem entrar novamente, serão removidos automaticamente.`,
            mentions: mentioned
        });
    } catch (error) {
        console.error('Erro ao banir membro:', error);
        await sock.sendMessage(jid, { 
            text: '❌ Erro ao banir membro. Verifique se tenho permissão.' 
        });
    }
};
