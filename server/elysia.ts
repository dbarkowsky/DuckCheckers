import { ServerWebSocket } from "bun";
import { Elysia } from "elysia";
import { ElysiaWS } from "elysia/ws";

export const app = new Elysia();

const connections: ElysiaWS<ServerWebSocket<any>>[] = [];

app.get("/games", () => "Hello Elysia");

app.ws("/ws", {
  message(ws, message) {
    console.log(`Message: ${ws.id}@${ws.remoteAddress} sends ${message}`);
    // Send message to all connections in the list.
    connections.forEach((conn) => {
      conn.send(message);
    });
  },
  open(ws) {
    console.log(`Connected: ${ws.id}@${ws.remoteAddress}`);
    ws.send("Hello");
    // Add the connection to the list
    connections.push(ws);
  },
  close(ws, code, message) {
    ws.send("Goodbye");
    console.log(`Disconnected: ${ws.id}@${ws.remoteAddress}`);
    // Remove the connection from the list
    connections.splice(
      connections.findIndex((conn) => conn.id === ws.id),
      1
    );
  },
});
