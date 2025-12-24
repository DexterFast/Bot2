const { getJid } = require('../../utils');
const axios = require('axios');
const config = require('../../config');

module.exports = async (sock, msg, args) => {
    const jid = getJid(msg);
    const query = args.join(' ');
    
    if (!query) {
        return sock.sendMessage(jid, { 
            text: '❌ Você precisa fornecer o nome da série!\n\nExemplo: !serie Game of Thrones' 
        });
    }
    
    if (!config.apis.tmdbKey || config.apis.tmdbKey === 'YOUR_TMDB_API_KEY') {
        return sock.sendMessage(jid, { 
            text: '❌ Chave da API TMDB não configurada! Edite o arquivo config.js para usar este comando.' 
        });
    }
    
    await sock.sendMessage(jid, { text: `📺 Buscando série "${query}"...` });
    
    try {
        const response = await axios.get(`${config.apis.tmdb}/search/tv`, {
            params: {
                api_key: config.apis.tmdbKey,
                query: query,
                language: 'pt-BR'
            }
        });
        
        const serie = response.data.results[0];
        
        if (!serie) {
            return sock.sendMessage(jid, { 
                text: '❌ Nenhuma série encontrada com este nome.' 
            });
        }
        
        const imageUrl = serie.poster_path ? `https://image.tmdb.org/t/p/w500${serie.poster_path}` : null;
        
        let message = `📺 *SÉRIE ENCONTRADA* 📺\n\n`;
        message += `*Título:* ${serie.name}\n`;
        message += `*Título Original:* ${serie.original_name}\n`;
        message += `*Primeiro Episódio:* ${serie.first_air_date}\n`;
        message += `*Nota:* ${serie.vote_average} / 10 (${serie.vote_count} votos)\n\n`;
        message += `*Sinopse:*\n${serie.overview || 'Sinopse não disponível.'}\n\n`;
        message += `🔗 Mais informações: https://www.themoviedb.org/tv/${serie.id}`;
        
        if (imageUrl) {
            await sock.sendMessage(jid, {
                image: { url: imageUrl },
                caption: message
            });
        } else {
            await sock.sendMessage(jid, { text: message });
        }
        
    } catch (error) {
        console.error('Erro no comando serie:', error);
        await sock.sendMessage(jid, { 
            text: '❌ Ocorreu um erro ao buscar a série. Verifique sua chave TMDB.' 
        });
    }
};
