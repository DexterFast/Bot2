const { getJid } = require('../../utils');

module.exports = async (sock, msg, args) => {
    const jid = getJid(msg);
    const start = Date.now();
    
    await sock.sendMessage(jid, { text: '🏓 Pong!' });
    
    const latency = Date.now() - start;
    await sock.sendMessage(jid, { 
        text: `⚡ Latência: ${latency}ms` 
    });
};
