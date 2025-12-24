const { getJid, getSender, isGroup, isBotAdmin } = require('../../utils');

module.exports = async (sock, msg, args) => {
    const jid = getJid(msg);
    const sender = getSender(msg);
    const senderName = sender.split('@')[0];
    
    // Verificar se está em grupo
    if (!isGroup(msg)) {
        return sock.sendMessage(jid, { 
            text: '❌ Este comando só funciona em grupos!\n\n⚠️ Você pode ser removido se perder!' 
        });
    }
    
    // Verificar se o bot é admin
    const botIsAdmin = await isBotAdmin(sock, msg);
    
    if (!botIsAdmin) {
        return sock.sendMessage(jid, { 
            text: '❌ Eu preciso ser administrador para jogar roleta russa!\n\n⚠️ Este jogo remove quem perde do grupo.' 
        });
    }
    
    await sock.sendMessage(jid, { 
        text: '🔫 Carregando a arma...' 
    });
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    await sock.sendMessage(jid, { 
        text: '🔫 Girando o tambor...' 
    });
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    await sock.sendMessage(jid, { 
        text: '🔫 Apontando para a cabeça...' 
    });
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 1 em 6 chances de "morrer" (16.67%)
    const survived = Math.random() > 0.166;
    
    if (survived) {
        // SOBREVIVEU
        const result = `🔫 *CLIQUE!* 🔫

😅 @${senderName} *SOBREVIVEU!*

🍀 Você teve sorte desta vez! A câmara estava vazia!

💚 Você continua no grupo... por enquanto! 😏`;
        
        await sock.sendMessage(jid, {
            text: result,
            mentions: [sender]
        });
    } else {
        // MORREU - SERÁ REMOVIDO!
        const result = `🔫 *BANG!* 💥

💀 @${senderName} *NÃO SOBREVIVEU!*

😵 A bala estava na câmara! 

🚪 Você será removido do grupo em 3 segundos... ☠️`;
        
        await sock.sendMessage(jid, {
            text: result,
            mentions: [sender]
        });
        
        // Aguardar 3 segundos antes de remover
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        try {
            // Remover do grupo
            await sock.groupParticipantsUpdate(jid, [sender], 'remove');
            
            // Mensagem após remoção
            await sock.sendMessage(jid, { 
                text: `⚰️ @${senderName} foi removido do grupo!\n\n🎮 Jogo da roleta russa concluído.\n\n⚠️ Quem quiser arriscar a sorte, use !roletarussa`,
                mentions: [sender]
            });
        } catch (error) {
            console.error('Erro ao remover usuário:', error);
            await sock.sendMessage(jid, { 
                text: '❌ Erro ao remover o usuário. Verifique se tenho permissão de administrador.' 
            });
        }
    }
};
