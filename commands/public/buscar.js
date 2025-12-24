const { getJid } = require('../../utils');
const axios = require('axios');

module.exports = async (sock, msg, args) => {
    const jid = getJid(msg);
    const query = args.join(' ');
    
    if (!query) {
        return sock.sendMessage(jid, { 
            text: '❌ Você precisa fornecer o que deseja buscar!\n\nExemplo: !buscar O que é o Baileys?' 
        });
    }
    
    await sock.sendMessage(jid, { text: `🔍 Buscando por "${query}"...` });
    
    try {
        // Usar API de busca (ex: DuckDuckGo Instant Answer API)
        const response = await axios.get('https://api.duckduckgo.com/', {
            params: {
                q: query,
                format: 'json',
                pretty: 1,
                no_html: 1,
                skip_disambig: 1
            }
        });
        
        const data = response.data;
        let resultText = `🔍 *Resultado da Busca para "${query}"* 🔍\n\n`;
        
        if (data.AbstractText) {
            resultText += `*Resumo:*\n${data.AbstractText}\n\n`;
            if (data.AbstractURL) {
                resultText += `🔗 *Fonte:* ${data.AbstractURL}\n\n`;
            }
        } else if (data.RelatedTopics && data.RelatedTopics.length > 0) {
            resultText += `*Tópicos Relacionados:*\n`;
            data.RelatedTopics.slice(0, 3).forEach(topic => {
                if (topic.Text) {
                    resultText += `• ${topic.Text}\n`;
                }
            });
        } else {
            resultText += '❌ Não foi possível encontrar um resultado direto para sua busca.';
        }
        
        await sock.sendMessage(jid, { text: resultText });
        
    } catch (error) {
        console.error('Erro no comando buscar:', error);
        await sock.sendMessage(jid, { 
            text: '❌ Ocorreu um erro ao realizar a busca. Tente novamente mais tarde.' 
        });
    }
};
