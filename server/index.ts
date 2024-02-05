import app from "./express";

const { FRONTEND_URL, SERVER_PORT } = process.env;

const port = +(SERVER_PORT ?? 9000);

app.listen(port);

console.log(`Express is running at ${FRONTEND_URL ?? `localhost:${port}`}`);
