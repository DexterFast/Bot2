const { getJid, getSender, isGroup } = require('../../utils');
const config = require('../../config');

module.exports = async (sock, msg, args) => {
    const jid = getJid(msg);
    const sender = getSender(msg);
    const pushname = msg.pushName || 'Usuário';
    
    // Obter nome do grupo se for grupo
    let groupName = '';
    if (isGroup(msg)) {
        try {
            const metadata = await sock.groupMetadata(jid);
            groupName = metadata.subject;
        } catch (e) {
            groupName = 'Grupo';
        }
    }
    
    const now = new Date();
    const dateTime = now.toLocaleString('pt-BR', { 
        timeZone: 'America/Sao_Paulo',
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    const menuText = `👋 Olá, *${pushname}*!

══════════════════
> 🤖 *${config.botName}*
> 🔧 *Prefixo atual: ${config.prefix}*          
> 🏷️ *Grupo: ${groupName || 'Privado'}*
> *${dateTime}*
══════════════════

═════〔 PÚBLICOS 〕═════
> *${config.prefix}batata*
> *${config.prefix}buscar* (Busca geral)
> *${config.prefix}casar*
> *${config.prefix}corno*
> *${config.prefix}divorciar*
> *${config.prefix}escolher*
> *${config.prefix}evoluir*
> *${config.prefix}feio*
> *${config.prefix}fight*
> *${config.prefix}filme* (Busca filmes no TMDB)
> *${config.prefix}getlid*
> *${config.prefix}jgvelha*
> *${config.prefix}kill*
> *${config.prefix}meme*
> *${config.prefix}menu*
> *${config.prefix}par*
> *${config.prefix}passar*
> *${config.prefix}perfil* (Ver seu perfil de ranking)
> *${config.prefix}ping*
> *${config.prefix}play* (Baixa áudio do YouTube)
> *${config.prefix}rename*
> *${config.prefix}roleta*
> *${config.prefix}roletarussa*
> *${config.prefix}serie* (Busca séries no TMDB)
> *${config.prefix}ship*
> *${config.prefix}staff*
> *${config.prefix}tofig*
> *${config.prefix}toimg*
════════════════

═════〔 ADMINS 〕═════
> *${config.prefix}antifig*
> *${config.prefix}antilink*
> *${config.prefix}ban*
> *${config.prefix}bl*
> *${config.prefix}citar*
> *${config.prefix}rebaixar*
> *${config.prefix}gp*
> *${config.prefix}kick*
> *${config.prefix}mute*
> *${config.prefix}admins*
> *${config.prefix}promover*
> *${config.prefix}roletaban*
> *${config.prefix}setprefix*
> *${config.prefix}unmute*
> *${config.prefix}unwarn*
> *${config.prefix}warnings*
> *${config.prefix}warn*
> *${config.prefix}welcome*
════════════════

═════〔 DONOS 〕═════
> *${config.prefix}setallowed*
> *${config.prefix}auto*
> *${config.prefix}autolearn*
> *${config.prefix}block*
> *${config.prefix}limpeza* (Remove inativos - 0 XP)
> *${config.prefix}podio*
> *${config.prefix}poprank*
> *${config.prefix}rank* (Ver seu rank e XP)
> *${config.prefix}ranking* (Ver o top 10 do grupo)
> *${config.prefix}resetweek* (Reseta o ranking semanal)
> *${config.prefix}visu*
> *${config.prefix}noperm*
> *${config.prefix}topweek* (Ver o top 10 semanal)
> *${config.prefix}unblockuser*
════════════════
> By ${config.ownerName}`;

    // Enviar com GIF de menu
    const menuGif = 'https://media.tenor.com/images/f3c9d3c8e8d8e8e8e8e8e8e8e8e8e8e8/tenor.gif';
    
    await sock.sendMessage(jid, { 
        text: menuText
    });
};
