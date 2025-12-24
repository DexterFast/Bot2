const { loadDatabase, saveDatabase } = require('./utils');

const RANKING_FILE = 'ranking.json';

// Função para obter o nível a partir da experiência
function getLevel(xp) {
    return Math.floor(0.1 * Math.sqrt(xp));
}

// Função para obter a experiência necessária para o próximo nível
function getXpForNextLevel(level) {
    return Math.pow((level + 1) / 0.1, 2);
}

// Função para adicionar experiência
function addXp(jid, sender, amount) {
    const ranking = loadDatabase(RANKING_FILE);
    
    if (!ranking[jid]) ranking[jid] = {};
    if (!ranking[jid][sender]) {
        ranking[jid][sender] = { xp: 0, level: 0, totalMessages: 0, lastMessage: 0 };
    }
    
    const user = ranking[jid][sender];
    
    // Limitar a adição de XP para evitar spam (ex: 5 segundos entre mensagens)
    if (Date.now() - user.lastMessage < 5000) {
        return { leveledUp: false, newLevel: user.level };
    }
    
    user.xp += amount;
    user.totalMessages += 1;
    user.lastMessage = Date.now();
    
    const oldLevel = user.level;
    const newLevel = getLevel(user.xp);
    
    let leveledUp = false;
    if (newLevel > oldLevel) {
        user.level = newLevel;
        leveledUp = true;
    }
    
    saveDatabase(RANKING_FILE, ranking);
    
    return { leveledUp, newLevel };
}

// Função para obter o ranking do grupo
function getGroupRanking(jid) {
    const ranking = loadDatabase(RANKING_FILE);
    if (!ranking[jid]) return [];
    
    const users = Object.entries(ranking[jid]).map(([sender, data]) => ({
        jid: sender,
        ...data
    }));
    
    // Ordenar por XP
    users.sort((a, b) => b.xp - a.xp);
    
    return users;
}

// Função para obter o ranking semanal (simplesmente usa o ranking geral por enquanto)
function getWeeklyRanking(jid) {
    // Em uma implementação real, isso envolveria um campo de XP semanal
    // Por simplicidade, retornamos o ranking geral
    return getGroupRanking(jid);
}

// Função para resetar o ranking semanal (dono)
function resetWeeklyRanking(jid) {
    const ranking = loadDatabase(RANKING_FILE);
    if (!ranking[jid]) return false;
    
    // Em uma implementação real, isso resetaria o campo de XP semanal
    // Por simplicidade, não faremos nada aqui, mas o comando existe
    
    return true;
}

// Função para obter o perfil do usuário
function getUserProfile(jid, sender) {
    const ranking = loadDatabase(RANKING_FILE);
    if (!ranking[jid] || !ranking[jid][sender]) {
        return { xp: 0, level: 0, totalMessages: 0, xpToNextLevel: getXpForNextLevel(0) };
    }
    
    const user = ranking[jid][sender];
    const xpToNextLevel = getXpForNextLevel(user.level);
    
    return {
        ...user,
        xpToNextLevel
    };
}

module.exports = {
    addXp,
    getGroupRanking,
    getWeeklyRanking,
    resetWeeklyRanking,
    getUserProfile,
    getLevel,
    getXpForNextLevel
};
