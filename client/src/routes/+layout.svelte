<script lang="ts">
	import { goto } from '$app/navigation';
	import { env } from '$env/dynamic/public';

	let dialog: HTMLDialogElement;
	const requestGame = async (player: 'red' | 'black') => {
		const response = await fetch(
			`http://${env.PUBLIC_SERVER_URL}:${env.PUBLIC_SERVER_PORT}/api/ongoing`,
			{
				method: 'POST'
			}
		);
		if (response.ok) {
			const newGame = await response.json();
			const params = new URLSearchParams({
				player
			});
			goto(`/game/${newGame.insertedId}?${params.toString()}`);
			dialog.close();
		} else {
			console.error(response.text(), response.status);
		}
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<nav>
	<h1><a href="/" id="home-link">Duck Checkers</a></h1>
	<button on:click={() => dialog.showModal()}>New Game</button>
</nav>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog
	bind:this={dialog}
	on:close
	class="dialog-background"
	on:click={(e) => {
		e.stopPropagation();
		dialog.close();
	}}
>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="dialog-window" on:click={(e) => e.stopPropagation()}>
		<button on:click={() => dialog.close()}>Cancel</button>
		<button on:click={() => requestGame('red')}>Red</button>
		<button on:click={() => requestGame('black')}>Black</button>
	</div>
</dialog>

<slot />

<style>
	nav {
		height: 50px;
		width: 100%;
		/* background-color: grey; */
		display: inline-flex;
		justify-content: space-between;
	}

	a#home-link {
		position: absolute;
		top: 5px;
		text-decoration: none;
		color: yellow;
		font-family: fantasy;
		font-size: 1.4em;
	}

	.dialog-window {
		width: 200px;
		height: 200px;
		margin: auto;

		background-color: black;
	}

	.dialog-background {
		width: 100vw;
		height: 100vh;
		background-color: rgba(255, 255, 255, 0.226);
	}
</style>
