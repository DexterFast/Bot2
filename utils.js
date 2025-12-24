const config = require('./config');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Funções auxiliares para manipulação de mensagens
function getCommand(text) {
    if (!text) return { command: null, args: [] };
    const prefix = config.prefix;
    if (!text.startsWith(prefix)) return { command: null, args: [] };
    const parts = text.slice(prefix.length).trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    return { command, args };
}

function getSender(msg) {
    return msg.key.participant || msg.key.remoteJid;
}

function getJid(msg) {
    return msg.key.remoteJid;
}

function isGroup(msg) {
    return getJid(msg).endsWith('@g.us');
}

function isOwner(msg) {
    const sender = getSender(msg).replace(/@s.whatsapp.net/g, '');
    const owner = config.ownerNumber.replace(/@s.whatsapp.net/g, '');
    return sender === owner;
}

async function isAdmin(sock, msg) {
    if (!isGroup(msg)) return false;
    try {
        const groupMetadata = await sock.groupMetadata(getJid(msg));
        const participant = groupMetadata.participants.find(
            p => p.id === getSender(msg)
        );
        return participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
    } catch (error) {
        console.error('Erro ao verificar admin:', error);
        return false;
    }
}

async function isBotAdmin(sock, msg) {
    if (!isGroup(msg)) return false;
    try {
        const groupMetadata = await sock.groupMetadata(getJid(msg));
        const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const participant = groupMetadata.participants.find(p => p.id === botJid);
        return participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
    } catch (error) {
        console.error('Erro ao verificar se bot é admin:', error);
        return false;
    }
}

function getMentioned(msg) {
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    return mentioned;
}

function getQuoted(msg) {
    return msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
}

function getQuotedSender(msg) {
    return msg.message?.extendedTextMessage?.contextInfo?.participant || null;
}

async function downloadMedia(msg) {
    try {
        const { downloadMediaMessage } = require('@whiskeysockets/baileys');
        const buffer = await downloadMediaMessage(msg, 'buffer', {});
        return buffer;
    } catch (error) {
        console.error('Erro ao baixar mídia:', error);
        return null;
    }
}

function randomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Funções de banco de dados simples (JSON)
function loadDatabase(filename) {
    const filepath = path.join(__dirname, 'database', filename);
    if (!fs.existsSync(filepath)) {
        fs.writeFileSync(filepath, JSON.stringify({}));
        return {};
    }
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
}

function saveDatabase(filename, data) {
    const filepath = path.join(__dirname, 'database', filename);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

// Funções para jogos e interações
function getGroupMembers(sock, groupJid) {
    return sock.groupMetadata(groupJid).then(metadata => {
        return metadata.participants.map(p => p.id);
    });
}

async function downloadFromUrl(url, filepath) {
    try {
        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'arraybuffer'
        });
        fs.writeFileSync(filepath, response.data);
        return filepath;
    } catch (error) {
        console.error('Erro ao baixar arquivo:', error);
        return null;
    }
}

module.exports = {
    getCommand,
    getSender,
    getJid,
    isGroup,
    isOwner,
    isAdmin,
    isBotAdmin,
    getMentioned,
    getQuoted,
    getQuotedSender,
    downloadMedia,
    randomElement,
    sleep,
    loadDatabase,
    saveDatabase,
    getGroupMembers,
    downloadFromUrl
};
