const { getJid } = require('../../utils');
const axios = require('axios');

module.exports = async (sock, msg, args) => {
    const jid = getJid(msg);
    
    await sock.sendMessage(jid, { text: '🔍 Buscando meme aleatório...' });
    
    try {
        // Usar API pública de memes do Reddit
        const response = await axios.get('https://meme-api.com/gimme');
        const meme = response.data;
        
        if (!meme || !meme.url) {
            return sock.sendMessage(jid, { 
                text: '❌ Não foi possível buscar um meme no momento. Tente novamente!' 
            });
        }
        
        const caption = `😂 *${meme.title}*\n\n👤 Por: u/${meme.author}\n⬆️ ${meme.ups} upvotes\n📱 r/${meme.subreddit}`;
        
        // Verificar se é imagem ou vídeo
        if (meme.url.endsWith('.gif') || meme.url.includes('gifs')) {
            await sock.sendMessage(jid, {
                video: { url: meme.url },
                gifPlayback: true,
                caption: caption
            });
        } else {
            await sock.sendMessage(jid, {
                image: { url: meme.url },
                caption: caption
            });
        }
    } catch (error) {
        console.error('Erro ao buscar meme:', error);
        await sock.sendMessage(jid, { 
            text: '❌ Erro ao buscar meme. A API pode estar temporariamente indisponível.' 
        });
    }
};
