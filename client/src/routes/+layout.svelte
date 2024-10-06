<script lang="ts">
	import { goto } from '$app/navigation';
	import { env } from '$env/dynamic/public';
	import { onMount } from 'svelte';
	import localStore from '../stores/localStore';
	import { generateSlug } from 'random-word-slugs';
	import Tooltip from '../components/Tooltip.svelte';

	$: gameNameField = '';
	$: dialogError = '';
	let dialog: HTMLDialogElement;
	const requestGame = async (player: 'red' | 'black') => {
		const response = await fetch(
			`http://${env.PUBLIC_SERVER_URL}:${env.PUBLIC_SERVER_PORT}/api/ongoing`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'	
				},
				body: JSON.stringify({
					gameName: gameNameField,
				})
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
			dialogError = await response.text();
		}
	};

	const generateName = () =>
		generateSlug(2, {
			partsOfSpeech: ['adjective', 'noun'],
			categories: {
				adjective: ['personality', 'appearance', 'color'],
				noun: ['animals']
			}
		});

	onMount(() => {
		let initialPlayerName = window.localStorage.getItem('playerName');
		if (initialPlayerName == null) {
			initialPlayerName = generateName();
			window.localStorage.setItem('playerName', initialPlayerName);
		}
		localStore.setPlayerName(initialPlayerName);
	});
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<nav>
	<h1><a href="/" id="home-link">Duck Checkers</a></h1>
	<div id="name-box">
	<span>{'Your Name: '}</span>
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<Tooltip
		tooltipText={'Click to scramble name'}
		onClick={() => {
			const newName = generateName();
			window.localStorage.setItem('playerName', newName);
			localStore.setPlayerName(newName);
		}}
	>
		<span>{$localStore.playerName}</span>
	</Tooltip>
</div>
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
		<input type="text" bind:value={gameNameField}/>
		{#if dialogError.length}<p class="error-text">{dialogError}</p>{/if}
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

	#name-box {
		display: flex;
		align-items: center;
		gap: 1em;
		color: yellow;
	}

	.error-text {
		color: red;
	}
</style>
