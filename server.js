const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let players = [];

wss.on('connection', function connection(ws) {
  console.log('Novo jogador conectado');
  players.push(ws);

  if (players.length === 1) {
    ws.send(JSON.stringify({ type: 'waiting' }));
  } else if (players.length === 2) {
    // Informar que o jogo começa
    players.forEach(player => {
      player.send(JSON.stringify({ type: 'start' }));
    });
  }

  ws.on('message', function incoming(message) {
    // Repassar mensagens entre jogadores
    players.forEach(player => {
      if (player !== ws && player.readyState === WebSocket.OPEN) {
        player.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('Jogador desconectado');
    players = players.filter(p => p !== ws);
  });
});
