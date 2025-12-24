const { getJid, getSender, isGroup, getMentioned } = require('../../utils');
const ranking = require('../../ranking');

module.exports = async (sock, msg, args) => {
    const jid = getJid(msg);
    
    if (!isGroup(msg)) {
        return sock.sendMessage(jid, { 
            text: '❌ Este comando só funciona em grupos!' 
        });
    }
    
    const mentioned = getMentioned(msg);
    const target = mentioned.length > 0 ? mentioned[0] : getSender(msg);
    
    const profile = ranking.getUserProfile(jid, target);
    
    const xpCurrentLevel = ranking.getXpForNextLevel(profile.level - 1);
    const xpNextLevel = ranking.getXpForNextLevel(profile.level);
    const xpNeeded = xpNextLevel - profile.xp;
    
    const rankText = `👤 *PERFIL DO USUÁRIO* 👤

@${target.split('@')[0]}

✨ **Nível:** ${profile.level}
🌟 **XP Total:** ${profile.xp}
💬 **Mensagens:** ${profile.totalMessages}

📈 **Progresso:**
- XP para o próximo nível (${profile.level + 1}): ${xpNeeded}
- Total de XP no nível atual: ${profile.xp - xpCurrentLevel} / ${xpNextLevel - xpCurrentLevel}
`;
    
    await sock.sendMessage(jid, {
        text: rankText,
        mentions: [target]
    });
};
