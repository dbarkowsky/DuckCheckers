import { app } from './elysia';

const port = +(process.env.SERVER_PORT ?? 9000);

app.listen(port);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
