const { getJid, isGroup } = require('../../utils');
const ranking = require('../../ranking');

module.exports = async (sock, msg, args) => {
    const jid = getJid(msg);
    
    if (!isGroup(msg)) {
        return sock.sendMessage(jid, { 
            text: '❌ Este comando só funciona em grupos!' 
        });
    }
    
    const weeklyRanking = ranking.getWeeklyRanking(jid);
    
    if (weeklyRanking.length === 0) {
        return sock.sendMessage(jid, { 
            text: '❌ Nenhum dado de ranking semanal encontrado neste grupo.' 
        });
    }
    
    let rankingText = `🗓️ *TOP 10 DA SEMANA* 🗓️\n\n`;
    
    weeklyRanking.slice(0, 10).forEach((user, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `*${index + 1}º*`;
        rankingText += `${medal} @${user.jid.split('@')[0]} - Nível ${user.level} (${user.xp} XP)\n`;
    });
    
    await sock.sendMessage(jid, {
        text: rankingText,
        mentions: weeklyRanking.slice(0, 10).map(user => user.jid)
    });
};
