const { getJid, isGroup } = require('../../utils');
const ranking = require('../../ranking');

module.exports = async (sock, msg, args) => {
    const jid = getJid(msg);
    
    if (!isGroup(msg)) {
        return sock.sendMessage(jid, { 
            text: '❌ Este comando só funciona em grupos!' 
        });
    }
    
    const success = ranking.resetWeeklyRanking(jid);
    
    if (success) {
        await sock.sendMessage(jid, { 
            text: '✅ Ranking semanal resetado com sucesso! Uma nova semana de competição começa agora!' 
        });
    } else {
        await sock.sendMessage(jid, { 
            text: '❌ Erro ao resetar o ranking semanal.' 
        });
    }
};
