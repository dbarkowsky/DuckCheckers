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
					gameName: gameNameField
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
  	<button id="new-game" on:click={() => dialog.showModal()}>New Game</button>
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
    <span>New Game</span>
		<input type="text" bind:value={gameNameField} placeholder="Choose Game Name"/>
		{#if dialogError.length}<p class="error-text">{dialogError}</p>{/if}
		<button class="red-button" on:click={() => requestGame('red')}>Start as Red</button>
		<button class="black-button" on:click={() => requestGame('black')}>Start as Black</button>
	</div>
</dialog>

<style lang="scss">
	nav {
		height: fit-content;
		width: 100%;
		display: flex;
    flex-wrap: wrap;
		justify-content: space-between;
    margin: 0 auto;
	}

	a#home-link {
		text-decoration: none;
		color: yellow;
    font-family: "Chicle", serif;    
    font-weight: 300;
		font-size: 1.6em;
	}

	.dialog-window {
		width: 200px;
		height: fit-content;
    padding: 2em;
		margin: auto;
    margin-top: 200px;
		background-color: rgb(43, 43, 43);
    display: flex;
    flex-direction: column;
    border: 1px solid yellow;
    border-radius: 10px;

    span {
      color: yellow;
    font-family: "Chicle", serif;    
    font-weight: 300;
		font-size: 1.6em;
    margin: 0 auto;
    }

    input {
      margin: 5px 0;
    }
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
    margin: 1em;
    margin-right: 0;
    font-family: "Atma", system-ui;
	}

  #new-game {
    height: 50px;
    width: 100%;
    min-width: 280px;
    font-family: "Atma", system-ui;
    font-weight: 700;
    font-size: 2em;
    margin: auto;
    background-color: #232327;
    border: 1px solid white;
    color: yellow;
    border-radius: 10px;
    &:hover {
      background-color: rgb(78, 78, 78);
    }
  }

  button {
    cursor: pointer;
    font-family: "Atma", system-ui;
    font-weight: 500;
    margin: 5px 0;
  }

  .black-button {
    background-color: #232327;
    border: 1px solid white;
    color: white;
    border-radius: 4px;
    &:hover {
      background-color: rgb(78, 78, 78);
    }
  }

  .red-button {
    background-color:  rgb(255, 103, 103);
    border: 1px solid white;
    color: black;
    border-radius: 4px;
    &:hover {
      background-color: rgb(141, 55, 55);
    }
  }

	.error-text {
		color: red;
	}
</style>
