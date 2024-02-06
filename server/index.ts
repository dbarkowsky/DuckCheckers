import app from "./express";
import ws from 'ws';
import http from 'http';

const { FRONTEND_URL, SERVER_PORT } = process.env;

const port = +(SERVER_PORT ?? 9000);

// Websocket Mock Server
const wsServer = new ws.Server({noServer: true}); // Not a real server.
wsServer.on('connection', socket => {
  socket.addEventListener('message', (e) => {
    console.log(e.data.toString())
    // Single client return
    socket.send('Return message ' + e.data.toString())
    // Broadcast return
    wsServer.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send('everyone, see this!');
      }
    })
  })
})

// Using to wrap express server
const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Express is running at ${FRONTEND_URL ?? `localhost:${port}`}`);
});
// Handles upgrade from HTTP to WS. Emits a connection event
server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    wsServer.emit('connection', socket, request);
  });
});

