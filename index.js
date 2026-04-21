const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('Bot de dados rodando 🎲');
});

app.listen(3000, () => {
  console.log('Servidor web ativo');
});

const client = new Client();

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('WhatsApp conectado!');
});

function rollDice(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

client.on('message', message => {
  console.log('Mensagem recebida:', message.body);

  const text = message.body.toLowerCase().trim();

  if (text.startsWith('/roll')) {
    const match = text.match(/(\d+)d(\d+)/);

    if (match) {
      const quantidade = parseInt(match[1]);
      const lados = parseInt(match[2]);

      let resultados = [];

      for (let i = 0; i < quantidade; i++) {
        resultados.push(Math.floor(Math.random() * lados) + 1);
      }

      const soma = resultados.reduce((a, b) => a + b, 0);

      message.reply(`🎲 ${quantidade}d${lados}: [${resultados.join(', ')}] → Total: ${soma}`);
    } else {
      message.reply('Usa assim: /roll 2d6');
    }

  } else if (text.startsWith('/d')) {
    const sides = parseInt(text.replace('/d', ''));

    if (!isNaN(sides)) {
      const result = rollDice(sides);
      message.reply(`🎲 d${sides}: ${result}`);
    } else {
      message.reply('Usa assim: /d20, /d6...');
    }
  }
});

client.initialize();