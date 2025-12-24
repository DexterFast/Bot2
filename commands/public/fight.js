const { getJid, getMentioned, getSender, randomElement, downloadFromUrl } = require('../../utils');
const config = require('../../config');
const path = require('path');

module.exports = async (sock, msg, args) => {
    const jid = getJid(msg);
    const mentioned = getMentioned(msg);
    const sender = getSender(msg);
    
    if (mentioned.length === 0) {
        return sock.sendMessage(jid, { 
            text: '❌ Você precisa marcar alguém para lutar!\n\nExemplo: !fight @pessoa' 
        });
    }
    
    const target = mentioned[0];
    const targetName = target.split('@')[0];
    const senderName = sender.split('@')[0];
    
    // Escolher vencedor aleatoriamente
    const winner = Math.random() > 0.5 ? sender : target;
    const loser = winner === sender ? target : sender;
    const winnerName = winner.split('@')[0];
    const loserName = loser.split('@')[0];
    
    // Escolher GIF aleatório de luta
    const fightGif = randomElement(config.gifs.fight);
    
    // Calcular dano
    const damage = Math.floor(Math.random() * 100) + 1;
    
    // Mensagens variadas de luta
    const messages = [
        `⚔️ *LUTA ÉPICA!* ⚔️\n\n@${senderName} desafiou @${targetName} para uma batalha!\n\n💥 Após uma luta intensa...\n\n🏆 *@${winnerName}* venceu causando *${damage} de dano*!\n\n😵 @${loserName} foi derrotado!`,
        `🥊 *COMBATE INICIADO!* 🥊\n\n@${senderName} VS @${targetName}\n\n💪 A batalha foi acirrada...\n\n✨ *@${winnerName}* saiu vitorioso com *${damage} de dano*!\n\n💀 @${loserName} não teve chance!`,
        `⚡ *DUELO EXPLOSIVO!* ⚡\n\n@${senderName} e @${targetName} se enfrentaram!\n\n🔥 Após muitos golpes...\n\n🎯 *@${winnerName}* acertou o golpe final de *${damage} de dano*!\n\n😢 @${loserName} foi nocauteado!`
    ];
    
    const message = randomElement(messages);
    
    try {
        // Baixar GIF
        const tempPath = path.join(__dirname, '../../temp', `fight_${Date.now()}.gif`);
        await downloadFromUrl(fightGif, tempPath);
        
        // Enviar GIF com legenda
        await sock.sendMessage(jid, {
            video: { url: tempPath },
            gifPlayback: true,
            caption: message,
            mentions: [sender, target, winner, loser]
        });
        
        // Limpar arquivo temporário
        const fs = require('fs');
        if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
        }
    } catch (error) {
        console.error('Erro ao enviar GIF:', error);
        await sock.sendMessage(jid, { 
            text: message,
            mentions: [sender, target, winner, loser]
        });
    }
};
