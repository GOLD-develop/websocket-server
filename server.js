const http = require('http');
const WebSocket = require('ws');

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('OK');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
  console.log('クライアント接続');

  ws.on('message', message => {
    console.log('受信:', message.toString());

    const response = {
      eventName: "test:response",
      data: `Echo: ${message.toString()}`
    };

    ws.send(JSON.stringify(response));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`サーバー起動: ポート ${PORT}`);
});
