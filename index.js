const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('Bot de dados rodando 🎲');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Servidor web ativo');
}); 

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: './.wwebjs_auth'
  }),
  puppeteer: {
    headless: true,
    executablePath: '/usr/bin/chromium',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  }
});

client.on('auth_failure', msg => {
  console.error('Erro de autenticação:', msg);
});

client.on('disconnected', reason => {
  console.log('Bot desconectado:', reason);
});

client.on('qr', qr => {
  console.log('Escaneie aqui:');
  console.log(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`);
});

client.on('ready', () => {
  console.log('WhatsApp conectado!');
});

function rollDice(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

client.on('message', message => {
  // if (message.fromMe) return;

  console.log('Mensagem recebida:', message.body);

  const text = message.body.toLowerCase().trim();

  if (text.startsWith('/roll')) {
    const expression = text.replace('/roll', '').trim();

    const parts = expression.split('+');
    let total = 0;
    let detalhes = [];

    parts.forEach(part => {
      part = part.trim();

      if (part.includes('d')) {
        let [quantidade, lados] = part.split('d');

        // permite "d20" (sem número antes)
        quantidade = quantidade === '' ? 1 : parseInt(quantidade);
        lados = parseInt(lados);

        if (!isNaN(quantidade) && !isNaN(lados)) {
          let resultados = [];

          for (let i = 0; i < quantidade; i++) {
            const roll = Math.floor(Math.random() * lados) + 1;
            resultados.push(roll);
            total += roll;
          }

          detalhes.push(`${quantidade}d${lados} [${resultados.join(', ')}]`);
        }

      } else {
        const numero = parseInt(part);

        if (!isNaN(numero)) {
          total += numero;
          detalhes.push(`${numero}`);
        }
      }
    });

    message.reply(`🎲 ${expression}\n➡️ ${detalhes.join(' + ')}\n🏆 Total: ${total}`);
  }
});

client.initialize();