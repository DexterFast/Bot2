const { getJid, isGroup } = require('../../utils');

module.exports = async (sock, msg, args) => {
    const jid = getJid(msg);
    
    if (!isGroup(msg)) {
        return sock.sendMessage(jid, { 
            text: '❌ Este comando só funciona em grupos!' 
        });
    }
    
    try {
        const groupMetadata = await sock.groupMetadata(jid);
        const admins = groupMetadata.participants
            .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
            .map(p => p.id);
        
        if (admins.length === 0) {
            return sock.sendMessage(jid, { 
                text: '❌ Não há administradores neste grupo!' 
            });
        }
        
        const reason = args.join(' ') || 'Atenção necessária!';
        
        let text = `🚨 *CHAMANDO ADMINISTRADORES* 🚨\n\n📢 Motivo: ${reason}\n\n`;
        text += admins.map(admin => `@${admin.split('@')[0]}`).join('\n');
        
        await sock.sendMessage(jid, {
            text: text,
            mentions: admins
        });
        
    } catch (error) {
        console.error('Erro ao chamar admins:', error);
        await sock.sendMessage(jid, { 
            text: '❌ Erro ao buscar administradores do grupo.' 
        });
    }
};
