const config = require('./config');
const ranking = require('./ranking');
const utils = require('./utils');
const fs = require('fs');
const path = require('path');

// Carregar todos os comandos dinamicamente
const commands = {};

function loadCommands(dir, category) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        if (file.endsWith('.js')) {
            const commandName = file.replace('.js', '');
            commands[commandName] = {
                execute: require(path.join(dir, file)),
                category: category
            };
        }
    });
}

// Carregar comandos de todas as categorias
loadCommands(path.join(__dirname, 'commands', 'public'), 'public');
loadCommands(path.join(__dirname, 'commands', 'admin'), 'admin');
loadCommands(path.join(__dirname, 'commands', 'owner'), 'owner');

// Listas de comandos por categoria
const adminCommands = ['kick', 'ban', 'promover', 'rebaixar', 'admins', 'antilink', 'antifig', 'warn', 'unwarn', 'warnings', 'mute', 'unmute', 'welcome', 'bl', 'citar', 'gp', 'roletaban', 'setprefix'];
const ownerCommands = ['block', 'unblockuser', 'setallowed', 'auto', 'autolearn', 'limpeza', 'podio', 'poprank', 'resetweek', 'visu', 'noperm'];

module.exports = async (sock, msg) => {
    try {
        // Extrair informações da mensagem
        const body = msg.message?.conversation || 
                     msg.message?.extendedTextMessage?.text || 
                     msg.message?.imageMessage?.caption ||
                     msg.message?.videoMessage?.caption || '';
        
        const { command, args } = utils.getCommand(body);
        const jid = utils.getJid(msg);
        const sender = utils.getSender(msg);
        const isGroup = utils.isGroup(msg);
        const isOwner = utils.isOwner(msg);
        
        // Verificar antilink
        if (isGroup) {
            const antilinkSettings = utils.loadDatabase('antilink.json');
            if (antilinkSettings[jid] && !isOwner && !await utils.isAdmin(sock, msg)) {
                const linkRegex = /(https?:\/\/|www\.)[^\s]+/gi;
                if (linkRegex.test(body)) {
                    try {
                        if (await utils.isBotAdmin(sock, msg)) {
                            await sock.sendMessage(jid, { 
                                text: '🚫 Link detectado! Mensagem removida.',
                                mentions: [sender]
                            });
                            await sock.sendMessage(jid, { delete: msg.key });
                        }
                    } catch (error) {
                        console.error('Erro no antilink:', error);
                    }
                }
            }
        }
        
        // Se não for comando, retornar
        if (!command) {
            // Adicionar XP para mensagens que não são comandos
            if (isGroup) {
                ranking.addXp(jid, sender, 5); // 5 XP por mensagem
            }
            return;
        }
        
        // Verificar se o comando existe
        if (!commands[command]) {
            return; // Comando não encontrado, ignorar silenciosamente
        }
        
        // Verificar permissões
        const isAdminCmd = adminCommands.includes(command);
        const isOwnerCmd = ownerCommands.includes(command);
        
        if (isOwnerCmd && !isOwner) {
            return sock.sendMessage(jid, { 
                text: '❌ Este comando é exclusivo para o dono do bot!' 
            });
        }
        
        if (isAdminCmd && !isOwner) {
            if (!isGroup) {
                return sock.sendMessage(jid, { 
                    text: '❌ Este comando só funciona em grupos!' 
                });
            }
            
            const isAdmin = await utils.isAdmin(sock, msg);
            if (!isAdmin) {
                return sock.sendMessage(jid, { 
                    text: '❌ Este comando é exclusivo para administradores do grupo!' 
                });
            }
        }
        

        
        // Executar comando
        console.log(`[COMANDO] ${sender.split('@')[0]} executou: ${config.prefix}${command}`);
        await commands[command].execute(sock, msg, args);
        
    } catch (error) {
        console.error('Erro no handler:', error);
        try {
            await sock.sendMessage(utils.getJid(msg), { 
                text: '❌ Ocorreu um erro ao processar o comando.' 
            });
        } catch (e) {
            console.error('Erro ao enviar mensagem de erro:', e);
        }
    }
};
