const { getJid, isGroup } = require('../../utils');
const ytsr = require('ytsr');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

module.exports = async (sock, msg, args) => {
    const jid = getJid(msg);
    const query = args.join(' ');
    
    if (!query) {
        return sock.sendMessage(jid, { 
            text: '❌ Você precisa fornecer o nome da música ou vídeo!\n\nExemplo: !play Imagine Dragons Believer' 
        });
    }
    
    await sock.sendMessage(jid, { text: `🔍 Buscando "${query}" no YouTube...` });
    
    try {
        const searchResults = await ytsr(query, { limit: 1 });
        const video = searchResults.items.find(item => item.type === 'video');
        
        if (!video) {
            return sock.sendMessage(jid, { 
                text: '❌ Nenhum resultado encontrado para sua busca.' 
            });
        }
        
        const videoUrl = video.url;
        const videoTitle = video.title;
        
        await sock.sendMessage(jid, { text: `✅ Encontrado: *${videoTitle}*\n\n⬇️ Baixando áudio...` });
        
        // Baixar áudio
        const tempPath = path.join(__dirname, '../../temp', `${video.id}.mp3`);
        
        const stream = ytdl(videoUrl, { 
            filter: 'audioonly',
            quality: 'lowestaudio'
        });
        
        stream.pipe(fs.createWriteStream(tempPath));
        
        stream.on('end', async () => {
            await sock.sendMessage(jid, { text: '🎶 Enviando áudio...' });
            
            await sock.sendMessage(jid, {
                audio: fs.readFileSync(tempPath),
                mimetype: 'audio/mp4',
                fileName: `${videoTitle}.mp3`,
                ptt: false // Não enviar como áudio de voz
            });
            
            // Limpar arquivo temporário
            if (fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }
        });
        
        stream.on('error', (error) => {
            console.error('Erro ao baixar áudio:', error);
            sock.sendMessage(jid, { 
                text: '❌ Erro ao baixar o áudio do YouTube.' 
            });
        });
        
    } catch (error) {
        console.error('Erro no comando play:', error);
        await sock.sendMessage(jid, { 
            text: '❌ Ocorreu um erro ao buscar ou baixar o vídeo.' 
        });
    }
};
