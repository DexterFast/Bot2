const { getJid, isGroup } = require('../../utils');
const ranking = require('../../ranking');

module.exports = async (sock, msg, args) => {
    const jid = getJid(msg);
    
    if (!isGroup(msg)) {
        return sock.sendMessage(jid, { 
            text: '❌ Este comando só funciona em grupos!' 
        });
    }
    
    const groupRanking = ranking.getGroupRanking(jid);
    
    if (groupRanking.length === 0) {
        return sock.sendMessage(jid, { 
            text: '❌ Nenhum dado de ranking encontrado neste grupo. Comece a conversar!' 
        });
    }
    
    let rankingText = `🏆 *RANKING GERAL DO GRUPO* 🏆\n\n`;
    
    groupRanking.slice(0, 10).forEach((user, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `*${index + 1}º*`;
        rankingText += `${medal} @${user.jid.split('@')[0]} - Nível ${user.level} (${user.xp} XP)\n`;
    });
    
    await sock.sendMessage(jid, {
        text: rankingText,
        mentions: groupRanking.slice(0, 10).map(user => user.jid)
    });
};
