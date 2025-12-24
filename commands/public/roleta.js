const { getJid, getSender } = require('../../utils');

module.exports = async (sock, msg, args) => {
    const jid = getJid(msg);
    const sender = getSender(msg);
    const senderName = sender.split('@')[0];
    
    await sock.sendMessage(jid, { 
        text: '🎰 Girando a roleta...' 
    });
    
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Resultado aleatório
    const number = Math.floor(Math.random() * 37); // 0-36
    const color = number === 0 ? 'Verde' : (number % 2 === 0 ? 'Vermelho' : 'Preto');
    
    let emoji = '';
    if (color === 'Verde') emoji = '🟢';
    else if (color === 'Vermelho') emoji = '🔴';
    else emoji = '⚫';
    
    const result = `🎰 *RESULTADO DA ROLETA* 🎰

👤 Jogador: @${senderName}

🎲 Número: *${number}*
${emoji} Cor: *${color}*

${number === 0 ? '🎉 JACKPOT! Número especial!' : ''}`;
    
    await sock.sendMessage(jid, {
        text: result,
        mentions: [sender]
    });
};
