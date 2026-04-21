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