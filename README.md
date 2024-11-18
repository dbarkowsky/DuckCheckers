# Duck Checkers

This was a project that I started for someone who wanted a Checkers version of [Duck Chess](https://www.chess.com/terms/duck-chess).

For myself, I aimed to learn:

- how to use the [Bun](https://bun.sh/) runtime instead of Node
- how to build a frontend using [SvelteKit](https://svelte.dev/docs/kit/introduction)
- how to use [websockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) for data transfer

## Running the Game

If you only want to run the game, you'll need Docker installed and running first. Consider using [Docker Desktop](https://www.docker.com/products/docker-desktop/).

Follow the `.env-template` files and create a `.env` file in the root directory.

Then you can run `docker-compose up mongo app api -d` to start the application, which should be available on `localhost:4173`.

## Development

I started this project when Bun wasn't available for Windows. In order to get around this, there's a development container available.

1. Populate the `.env` based on the `.env-template`.
2. There's another `.env` needed in the `/client` folder.
3. Run `docker-compose up oven -d`.
4. Connect to the container using VS Code and the Attach to Running Container option.
5. Start the API from `/server` with `bun run i`, then `bun run dev`.
6. Start the frontend from `/client` with `bun run i`, then `bun run dev --host`.
