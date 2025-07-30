const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Minecraft WebSocket OK');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
  console.log('Minecraft クライアント接続');

  const subscribePacket = {
    header: {
      requestId: uuidv4(),
      messagePurpose: 'subscribe',
      version: 1
    },
    body: {
      eventName: 'PlayerMessage'
    }
  };
  ws.send(JSON.stringify(subscribePacket));

  ws.on('message', data => {
    try {
      const msg = JSON.parse(data);
      if (msg.header?.messagePurpose === 'event' && msg.header?.eventName === 'PlayerMessage') {
        const { sender, message } = msg.body;
        console.log(`[${sender}] ${message}`);
        const command = `tellraw @a {"rawtext":[{"text":"§f<${sender}§r§f> ${message}"}]}`;
        const packet = {
          header: {
            requestId: uuidv4(),
            messagePurpose: 'commandRequest',
            version: 1
          },
          body: {
            commandLine: command,
            version: 1
          }
        };
        ws.send(JSON.stringify(packet));
      }
    } catch (e) {
      console.error('受信エラー:', e);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`サーバー起動中 (ポート ${PORT})`);
});
