const { getJid, isGroup, loadDatabase, saveDatabase } = require('../../utils');

module.exports = async (sock, msg, args) => {
    const jid = getJid(msg);
    
    if (!isGroup(msg)) {
        return sock.sendMessage(jid, { 
            text: '❌ Este comando só funciona em grupos!' 
        });
    }
    
    const action = args[0]?.toLowerCase();
    
    if (!action || !['on', 'off'].includes(action)) {
        return sock.sendMessage(jid, { 
            text: '❌ Use: !antilink on ou !antilink off' 
        });
    }
    
    // Carregar configurações
    const settings = loadDatabase('antilink.json');
    
    if (action === 'on') {
        settings[jid] = true;
        saveDatabase('antilink.json', settings);
        await sock.sendMessage(jid, { 
            text: '✅ Antilink ativado! Links serão removidos automaticamente.' 
        });
    } else {
        settings[jid] = false;
        saveDatabase('antilink.json', settings);
        await sock.sendMessage(jid, { 
            text: '✅ Antilink desativado!' 
        });
    }
};
