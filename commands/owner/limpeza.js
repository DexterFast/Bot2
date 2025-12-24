const { getJid, isGroup, isBotAdmin } = require('../../utils');

module.exports = async (sock, msg, args) => {
    const jid = getJid(msg);
    
    if (!isGroup(msg)) {
        return sock.sendMessage(jid, { 
            text: '❌ Este comando só funciona em grupos!' 
        });
    }
    
    if (!await isBotAdmin(sock, msg)) {
        return sock.sendMessage(jid, { 
            text: '❌ Eu preciso ser administrador para fazer a limpeza!' 
        });
    }
    
    await sock.sendMessage(jid, { 
        text: '🧹 Iniciando limpeza do grupo (remoção de membros inativos)...' 
    });
    
    try {
        const groupMetadata = await sock.groupMetadata(jid);
        const participants = groupMetadata.participants;
        
        // Lógica de limpeza: remover quem não é admin e não tem XP
        const ranking = require('../../ranking');
        const toRemove = [];
        
        for (const participant of participants) {
            const userJid = participant.id;
            const isAdmin = participant.admin === 'admin' || participant.admin === 'superadmin';
            const isBot = userJid === sock.user.id.split(':')[0] + '@s.whatsapp.net';
            const isOwner = userJid === require('../../config').ownerNumber;
            
            if (!isAdmin && !isBot && !isOwner) {
                const profile = ranking.getUserProfile(jid, userJid);
                
                // Critério de inatividade: 0 XP (nunca interagiu)
                if (profile.xp === 0) {
                    toRemove.push(userJid);
                }
            }
        }
        
        if (toRemove.length === 0) {
            return sock.sendMessage(jid, { 
                text: '✅ Limpeza concluída! Nenhum membro inativo (0 XP) encontrado para remoção.' 
            });
        }
        
        await sock.groupParticipantsUpdate(jid, toRemove, 'remove');
        
        await sock.sendMessage(jid, { 
            text: `✅ Limpeza concluída! ${toRemove.length} membro(s) inativo(s) (0 XP) foram removidos do grupo.`,
            mentions: toRemove
        });
        
    } catch (error) {
        console.error('Erro no comando limpeza:', error);
        await sock.sendMessage(jid, { 
            text: '❌ Ocorreu um erro ao realizar a limpeza. Verifique se o bot é admin.' 
        });
    }
};
