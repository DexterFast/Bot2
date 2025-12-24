const { getJid, isGroup, loadDatabase, saveDatabase, randomElement } = require('../../utils');

// Armazenar jogos ativos
let activeGames = {};

module.exports = async (sock, msg, args) => {
    const jid = getJid(msg);
    
    if (!isGroup(msg)) {
        return sock.sendMessage(jid, { 
            text: '❌ Este comando só funciona em grupos!' 
        });
    }
    
    // Verificar se já existe um jogo ativo
    if (activeGames[jid]) {
        return sock.sendMessage(jid, { 
            text: '⚠️ Já existe um jogo de batata quente ativo neste grupo!' 
        });
    }
    
    // Iniciar novo jogo
    activeGames[jid] = {
        holder: msg.key.participant || msg.key.remoteJid,
        startTime: Date.now(),
        explosionTime: Date.now() + (15000 + Math.random() * 15000) // 15-30 segundos
    };
    
    await sock.sendMessage(jid, {
        image: { url: 'file:///home/ubuntu/whatsapp-bot-completo/assets/batata_quente.gif' },
        caption: `🥔💣 *BATATA QUENTE INICIADA!* 💣🥔

A batata está com @${activeGames[jid].holder.split('@')[0]}!

⚠️ Use *!passar @pessoa* para passar a batata antes que ela EXPLODA! 💥

⏰ A batata vai explodir em algum momento nos próximos 15-30 segundos!`,
        mentions: [activeGames[jid].holder]
    });
    
    // Timer para explosão
    setTimeout(() => {
        if (activeGames[jid]) {
            const loser = activeGames[jid].holder;
            
            sock.sendMessage(jid, {
                text: `💥💥💥 *BOOOOM!* 💥💥💥

A batata EXPLODIU com @${loser.split('@')[0]}! 😱🔥

Você perdeu! Mais sorte na próxima vez! 🥔💀`,
                mentions: [loser]
            });
            
            delete activeGames[jid];
        }
    }, activeGames[jid].explosionTime - Date.now());
};

// Exportar o objeto de jogos ativos para acesso externo
module.exports.activeGames = activeGames;
