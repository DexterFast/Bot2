const { getJid, getMentioned, isGroup, loadDatabase, saveDatabase, isBotAdmin } = require('../../utils');

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
            text: '❌ Você precisa marcar alguém para avisar!\n\nExemplo: !warn @pessoa motivo' 
        });
    }
    
    const target = mentioned[0];
    const reason = args.join(' ') || 'Sem motivo especificado';
    
    // Carregar avisos
    const warns = loadDatabase('warns.json');
    if (!warns[jid]) warns[jid] = {};
    if (!warns[jid][target]) warns[jid][target] = [];
    
    // Adicionar aviso
    warns[jid][target].push({
        reason: reason,
        date: new Date().toISOString()
    });
    
    const warnCount = warns[jid][target].length;
    saveDatabase('warns.json', warns);
    
    let message = `⚠️ *AVISO ${warnCount}/3* ⚠️\n\n`;
    message += `👤 Usuário: @${target.split('@')[0]}\n`;
    message += `📝 Motivo: ${reason}\n\n`;
    
    if (warnCount >= 3) {
        message += `🚫 Limite de avisos atingido! Usuário será removido.`;
        
        // Remover do grupo se bot for admin
        if (await isBotAdmin(sock, msg)) {
            try {
                await sock.groupParticipantsUpdate(jid, [target], 'remove');
                warns[jid][target] = []; // Resetar avisos
                saveDatabase('warns.json', warns);
            } catch (error) {
                console.error('Erro ao remover usuário:', error);
            }
        }
    } else {
        message += `⚡ Mais ${3 - warnCount} aviso(s) e você será removido!`;
    }
    
    await sock.sendMessage(jid, {
        text: message,
        mentions: [target]
    });
};
