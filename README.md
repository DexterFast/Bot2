# 🤖 Bot WhatsApp Completo - F!NX Bot

Bot do WhatsApp completo e funcional com comandos públicos, de administração e de donos, incluindo GIFs engraçados e integração com APIs.

## ✨ Características

- ✅ **Comandos Públicos**: Jogos, diversão, memes, GIFs e interações
- ✅ **Comandos de Admin**: Moderação de grupos, kick, ban, warn, antilink
- ✅ **Comandos de Dono**: Controle total do bot, block, unblock
- ✅ **GIFs Animados**: Comandos com GIFs engraçados (kill, fight, casar, corno, feio)
- ✅ **APIs Integradas**: Memes do Reddit, busca de filmes/séries
- ✅ **Sistema de Avisos**: Warn system com limite de 3 avisos
- ✅ **Antilink**: Proteção automática contra links
- ✅ **Conversão de Mídia**: Converter imagens para figurinhas e vice-versa
- ✅ **Jogos Interativos**: Batata quente, ship, roleta, roleta russa, fight

## 📋 Pré-requisitos

- Node.js 16 ou superior
- NPM ou Yarn
- Conta do WhatsApp

## 🚀 Instalação

### 1. Instalar dependências

```bash
cd whatsapp-bot-completo
npm install
```

### 2. Configurar o bot

Edite o arquivo `config.js` e altere as seguintes informações:

```javascript
ownerNumber: '5511999999999', // SEU NÚMERO COM DDI (ex: 5511999999999)
botName: 'F!NX Bot',           // Nome do seu bot
ownerName: 'jvsilvazx🫩',      // Seu nome
```

### 3. Iniciar o bot

```bash
npm start
```

ou

```bash
node index.js
```

### 4. Conectar ao WhatsApp

1. Um QR Code aparecerá no terminal
2. Abra o WhatsApp no seu celular
3. Vá em **Dispositivos Conectados** → **Conectar Dispositivo**
4. Escaneie o QR Code
5. Pronto! O bot está online! ✅

## 📜 Comandos Disponíveis

### 🎮 COMANDOS PÚBLICOS

| Comando | Descrição |
|---------|-----------|
| `!menu` | Exibe o menu completo de comandos |
| `!ping` | Verifica a latência do bot |
| `!batata` | Inicia o jogo da batata quente |
| `!passar @pessoa` | Passa a batata para alguém |
| `!kill @pessoa` | Dá um fatality em alguém (GIF Mortal Kombat) |
| `!fight @pessoa` | Luta épica contra alguém (GIF de luta) |
| `!ship` | Shippa dois membros aleatórios do grupo |
| `!casar @pessoa` | Casa com alguém |
| `!divorciar` | Se divorcia |
| `!corno @pessoa` | Mede o nível de corno (0-100%) |
| `!feio @pessoa` | Mede o nível de feiura (0-100%) |
| `!meme` | Busca um meme aleatório do Reddit |
| `!escolher op1 op2 op3` | Escolhe entre opções |
| `!roleta` | Gira a roleta (0-36) |
| `!roletarussa` | Joga roleta russa (⚠️ REMOVE DO GRUPO SE PERDER!) |
| `!tofig` | Converte imagem para figurinha |
| `!toimg` | Converte figurinha para imagem |

### 👮 COMANDOS DE ADMIN

| Comando | Descrição |
|---------|-----------|
| `!kick @pessoa` | Remove membro do grupo |
| `!ban @pessoa` | Bane membro (não pode voltar) |
| `!promover @pessoa` | Promove membro a admin |
| `!rebaixar @pessoa` | Remove admin de membro |
| `!admins motivo` | Marca todos os admins |
| `!warn @pessoa motivo` | Dá aviso (3 = kick) |
| `!unwarn @pessoa` | Remove um aviso |
| `!warnings @pessoa` | Ver avisos de alguém |
| `!antilink on/off` | Ativa/desativa antilink |

### 👑 COMANDOS DE DONO

| Comando | Descrição |
|---------|-----------|
| `!block @pessoa` | Bloqueia usuário |
| `!unblockuser @pessoa` | Desbloqueia usuário |

## 🎯 Jogos e Interações

### 🥔 Batata Quente

1. Use `!batata` para iniciar
2. A batata começa com quem iniciou
3. Use `!passar @pessoa` para passar a batata
4. A batata explode aleatoriamente em 15-30 segundos
5. Quem estiver com a batata quando explodir perde!

### 💘 Ship

- Use `!ship` em um grupo
- O bot escolhe 2 membros aleatórios
- Calcula a compatibilidade (0-100%)
- Mostra mensagem personalizada baseada na porcentagem

### 🎰 Roleta e Roleta Russa

- **Roleta**: Simula uma roleta de cassino (0-36)
- **Roleta Russa**: 1 em 6 chances de "morrer" e **SER REMOVIDO DO GRUPO!**
  - ⚠️ **ATENÇÃO**: Este jogo é REAL! Se perder, você será removido do grupo!
  - O bot precisa ser administrador para funcionar
  - Use por sua conta e risco! 🔫💀

## 🔧 Configurações Avançadas

### APIs Opcionais

Para melhorar alguns comandos, você pode adicionar chaves de API no `config.js`:

```javascript
apis: {
    giphyKey: 'SUA_CHAVE_GIPHY', // Para GIFs melhores
    tmdbKey: 'SUA_CHAVE_TMDB'    // Para busca de filmes/séries
}
```

### GIFs Personalizados

Edite o arquivo `config.js` e altere as URLs dos GIFs:

```javascript
gifs: {
    kill: ['URL_DO_GIF_1', 'URL_DO_GIF_2'],
    fight: ['URL_DO_GIF_1', 'URL_DO_GIF_2'],
    // ...
}
```

## 📁 Estrutura do Projeto

```
whatsapp-bot-completo/
├── commands/
│   ├── public/          # Comandos públicos
│   ├── admin/           # Comandos de admin
│   └── owner/           # Comandos de dono
├── database/            # Banco de dados JSON
├── temp/                # Arquivos temporários
├── bot-session/         # Sessão do WhatsApp
├── config.js            # Configurações
├── index.js             # Arquivo principal
├── handler.js           # Handler de comandos
├── utils.js             # Funções utilitárias
├── package.json         # Dependências
└── README.md            # Este arquivo
```

## 🐛 Solução de Problemas

### Bot não conecta

- Apague a pasta `bot-session` e tente novamente
- Verifique sua conexão com a internet
- Certifique-se de que o WhatsApp está atualizado

### Comandos não funcionam

- Verifique se o prefixo está correto (padrão: `!`)
- Certifique-se de que o bot está online
- Veja os logs no terminal para erros

### GIFs não aparecem

- Verifique sua conexão com a internet
- As URLs dos GIFs podem estar offline
- Substitua por URLs válidas no `config.js`

### Bot não remove membros

- O bot precisa ser administrador do grupo
- Verifique se você é admin ao usar comandos de admin
- Veja os logs para mensagens de erro

## 📝 Notas Importantes

- ⚠️ **Não compartilhe a pasta `bot-session`** - contém credenciais
- ⚠️ **Use com responsabilidade** - respeite os termos do WhatsApp
- ⚠️ **Backup regular** - faça backup da pasta `database`
- ⚠️ **Mantenha atualizado** - atualize as dependências regularmente

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs no terminal
2. Consulte a seção de solução de problemas
3. Verifique se todas as dependências estão instaladas
4. Certifique-se de que o Node.js está atualizado

## 📄 Licença

MIT License - Livre para uso e modificação

## 👤 Autor

Desenvolvido por **jvsilvazx🫩**

---

**Divirta-se com seu bot! 🎉**
