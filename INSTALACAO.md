# 🚀 Guia Rápido de Instalação

## Passo 1: Extrair o arquivo

Extraia o arquivo `whatsapp-bot-completo.zip` em uma pasta de sua preferência.

## Passo 2: Instalar Node.js

Se você ainda não tem o Node.js instalado:

- **Windows/Mac**: Baixe em [nodejs.org](https://nodejs.org)
- **Linux**: 
  ```bash
  sudo apt update
  sudo apt install nodejs npm
  ```

Verifique a instalação:
```bash
node --version
npm --version
```

## Passo 3: Instalar dependências

Abra o terminal/prompt na pasta do bot e execute:

```bash
npm install
```

Aguarde a instalação de todas as dependências (pode levar alguns minutos).

## Passo 4: Configurar o bot

Abra o arquivo `config.js` com um editor de texto e altere:

```javascript
ownerNumber: '5511999999999', // COLOQUE SEU NÚMERO AQUI
```

**Importante**: Use o formato com DDI (código do país)
- Brasil: 55 + DDD + número (ex: 5511999999999)
- Portugal: 351 + número
- EUA: 1 + número

## Passo 5: Iniciar o bot

No terminal, execute:

```bash
npm start
```

ou

```bash
node index.js
```

## Passo 6: Conectar ao WhatsApp

1. Um **QR Code** aparecerá no terminal
2. Abra o WhatsApp no seu celular
3. Vá em: **Menu (⋮)** → **Dispositivos Conectados** → **Conectar Dispositivo**
4. Escaneie o QR Code que apareceu no terminal
5. Pronto! O bot está online! ✅

## 🎉 Pronto para usar!

Agora você pode:
- Enviar `!menu` para ver todos os comandos
- Testar com `!ping` para verificar se está funcionando
- Adicionar o bot em grupos e usar os comandos

## ⚠️ Dicas Importantes

1. **Mantenha o terminal aberto** - Se fechar, o bot desconecta
2. **Não escaneie o QR Code duas vezes** - Isso pode causar problemas
3. **Primeira vez**: A conexão pode demorar alguns segundos
4. **Problemas?**: Apague a pasta `bot-session` e tente novamente

## 🆘 Problemas Comuns

### "Erro ao instalar dependências"
```bash
npm cache clean --force
npm install
```

### "QR Code não aparece"
- Verifique sua conexão com a internet
- Tente reiniciar o bot
- Apague a pasta `bot-session` se existir

### "Comandos não funcionam"
- Verifique se você configurou o `ownerNumber` corretamente
- Certifique-se de usar o prefixo correto (padrão: `!`)
- Veja os logs no terminal para identificar erros

## 📱 Testando o Bot

Após conectar, envie estas mensagens para testar:

1. `!ping` - Verifica se o bot está respondendo
2. `!menu` - Mostra todos os comandos disponíveis
3. `!meme` - Busca um meme aleatório
4. `!ship` - Testa o comando ship (em grupos)

## 🔄 Manter o Bot Online 24/7

Para manter o bot sempre online, você pode:

1. **Usar um VPS** (Servidor Virtual)
   - Recomendado: DigitalOcean, AWS, Google Cloud
   - Instale o bot no servidor
   - Use `pm2` para manter rodando:
     ```bash
     npm install -g pm2
     pm2 start index.js --name whatsapp-bot
     pm2 save
     pm2 startup
     ```

2. **Usar seu computador**
   - Mantenha o computador ligado
   - Use `pm2` ou `nodemon` para reiniciar automaticamente

## 📞 Suporte

Se precisar de ajuda, consulte o arquivo `README.md` para mais detalhes!

---

**Boa sorte com seu bot! 🎉**
