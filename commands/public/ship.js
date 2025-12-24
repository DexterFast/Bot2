const { getJid, isGroup, getGroupMembers, randomElement } = require('../../utils');

module.exports = async (sock, msg, args) => {
    const jid = getJid(msg);
    
    if (!isGroup(msg)) {
        return sock.sendMessage(jid, { 
            text: '❌ Este comando só funciona em grupos!' 
        });
    }
    
    try {
        // Obter membros do grupo
        const members = await getGroupMembers(sock, jid);
        
        if (members.length < 2) {
            return sock.sendMessage(jid, { 
                text: '❌ Não há membros suficientes no grupo para shippar!' 
            });
        }
        
        // Selecionar dois membros aleatórios
        const person1 = randomElement(members);
        let person2 = randomElement(members);
        
        // Garantir que não seja a mesma pessoa
        while (person2 === person1 && members.length > 1) {
            person2 = randomElement(members);
        }
        
        const name1 = person1.split('@')[0];
        const name2 = person2.split('@')[0];
        
        // Calcular porcentagem de compatibilidade (aleatório mas consistente)
        const compatibility = Math.floor(Math.random() * 101);
        
        // Mensagens baseadas na compatibilidade
        let message = '';
        let emoji = '';
        
        if (compatibility >= 90) {
            emoji = '💖💖💖';
            message = 'Casal perfeito! Já podem marcar o casamento! 💒';
        } else if (compatibility >= 70) {
            emoji = '💕💕';
            message = 'Muita química! Tem futuro! 😍';
        } else if (compatibility >= 50) {
            emoji = '💗';
            message = 'Pode dar certo com um pouco de esforço! 😊';
        } else if (compatibility >= 30) {
            emoji = '💔';
            message = 'Complicado... mas quem sabe? 🤔';
        } else {
            emoji = '💔💔💔';
            message = 'Melhor ficarem só na amizade! 😅';
        }
        
        const shipText = `💘 *SHIP DO AMOR* 💘

👤 @${name1}
❤️ 
👤 @${name2}

${emoji} *Compatibilidade: ${compatibility}%* ${emoji}

${message}`;
        
        await sock.sendMessage(jid, {
            text: shipText,
            mentions: [person1, person2]
        });
        
    } catch (error) {
        console.error('Erro no comando ship:', error);
        await sock.sendMessage(jid, { 
            text: '❌ Erro ao executar o comando ship.' 
        });
    }
};
