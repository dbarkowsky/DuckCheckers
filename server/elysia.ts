import { Elysia } from "elysia";

export const app = new Elysia();

app.get("/games", () => "Hello Elysia");

app.ws("/ws", {
  message(ws, message) {
    ws.send(message);
  },
  open(ws) {
    console.log(`Connected: ${ws.id}`);
    console.log(ws.remoteAddress);
    console.log(ws.data);
    ws.send("Hello");
  },
  close(ws, code, message) {
    ws.send("Goodbye");
  },
});
