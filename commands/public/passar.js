const { getJid, isGroup, randomElement } = require("../../utils");
const { activeGames } = require("./batata");

module.exports = async (sock, msg, args) => {
    const jid = getJid(msg);
    const sender = msg.key.participant || msg.key.remoteJid;

    if (!isGroup(msg)) {
        return sock.sendMessage(jid, { 
            text: "❌ Este comando só funciona em grupos!" 
        });
    }

    if (!activeGames[jid]) {
        return sock.sendMessage(jid, { 
            text: "❌ Não há nenhum jogo de batata quente ativo! Use *!batata* para iniciar." 
        });
    }

    if (activeGames[jid].holder !== sender) {
        return sock.sendMessage(jid, { 
            text: "❌ Você não está com a batata! Apenas quem tem a batata pode passá-la." 
        });
    }

    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

    if (mentioned.length === 0) {
        return sock.sendMessage(jid, { 
            text: "❌ Você precisa marcar alguém para passar a batata!\n\nExemplo: !passar @pessoa" 
        });
    }

    const target = mentioned[0];

    if (target === sender) {
        return sock.sendMessage(jid, { 
            text: "❌ Você não pode passar a batata para si mesmo!" 
        });
    }

    activeGames[jid].holder = target;

    const messages = [
        `🥔 @${sender.split("@")[0]} passou a batata quente para @${target.split("@")[0]}! 🔥`,
        `🏃‍♂️💨 @${sender.split("@")[0]} jogou a batata para @${target.split("@")[0]}! Corre! 🥔💣`,
        `⚡ A batata mudou de mãos! Agora está com @${target.split("@")[0]}! 🥔🔥`
    ];

    await sock.sendMessage(jid, {
        text: randomElement(messages),
        mentions: [sender, target]
    });
};
