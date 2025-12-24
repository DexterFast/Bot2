const { getJid } = require('../../utils');
const axios = require('axios');
const config = require('../../config');

module.exports = async (sock, msg, args) => {
    const jid = getJid(msg);
    const query = args.join(' ');
    
    if (!query) {
        return sock.sendMessage(jid, { 
            text: '❌ Você precisa fornecer o nome do filme!\n\nExemplo: !filme Vingadores Ultimato' 
        });
    }
    
    if (!config.apis.tmdbKey || config.apis.tmdbKey === 'YOUR_TMDB_API_KEY') {
        return sock.sendMessage(jid, { 
            text: '❌ Chave da API TMDB não configurada! Edite o arquivo config.js para usar este comando.' 
        });
    }
    
    await sock.sendMessage(jid, { text: `🎬 Buscando filme "${query}"...` });
    
    try {
        const response = await axios.get(`${config.apis.tmdb}/search/movie`, {
            params: {
                api_key: config.apis.tmdbKey,
                query: query,
                language: 'pt-BR'
            }
        });
        
        const movie = response.data.results[0];
        
        if (!movie) {
            return sock.sendMessage(jid, { 
                text: '❌ Nenhum filme encontrado com este nome.' 
            });
        }
        
        const imageUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null;
        
        let message = `🎥 *FILME ENCONTRADO* 🎥\n\n`;
        message += `*Título:* ${movie.title}\n`;
        message += `*Título Original:* ${movie.original_title}\n`;
        message += `*Lançamento:* ${movie.release_date}\n`;
        message += `*Nota:* ${movie.vote_average} / 10 (${movie.vote_count} votos)\n\n`;
        message += `*Sinopse:*\n${movie.overview || 'Sinopse não disponível.'}\n\n`;
        message += `🔗 Mais informações: https://www.themoviedb.org/movie/${movie.id}`;
        
        if (imageUrl) {
            await sock.sendMessage(jid, {
                image: { url: imageUrl },
                caption: message
            });
        } else {
            await sock.sendMessage(jid, { text: message });
        }
        
    } catch (error) {
        console.error('Erro no comando filme:', error);
        await sock.sendMessage(jid, { 
            text: '❌ Ocorreu um erro ao buscar o filme. Verifique sua chave TMDB.' 
        });
    }
};
