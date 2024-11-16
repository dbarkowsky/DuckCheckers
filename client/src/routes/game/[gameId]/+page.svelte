<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Board from '../../../components/Board.svelte';
	import gameStore, { type DuckSocket } from '../../../stores/gameStore';
	import {
		MessageType,
		type BaseMessage,
		type GameStateMessage,
		type BoardStateMessage,
		type ArrivalMessage,
		type ArrivalResponse,
		type CommunicationMessage,
		type PlayerDataMessage
	} from '$lib/messages';
	import localStore, { PlayerPosition } from '../../../stores/localStore';
	import { env } from '$env/dynamic/public';
	import { page } from '$app/stores';
	import PlayerCard from '../../../components/PlayerCard/PlayerCard.svelte';
	import { goto } from '$app/navigation';
	import GameStateBoard from '../../../components/GameStateBoard.svelte';

	export let data;

	let fieldValue = '';
	let socket: DuckSocket;

	const playerRequestMap = (request: string | null) => {
		switch (request) {
			case 'red':
				return PlayerPosition.ONE;
			case 'black':
				return PlayerPosition.TWO;
			default:
				return PlayerPosition.OBSERVER;
		}
	};

	const playerRequest = playerRequestMap($page.url.searchParams.get('player'));
	onDestroy(() => {
		if (socket) socket.close();
	});
	onMount(() => {
		localStore.setPlayerName(window.localStorage.getItem('playerName'));
		socket = new WebSocket(
			`ws://${env.PUBLIC_SERVER_URL}:${env.PUBLIC_SERVER_PORT}/${data.gameId}`
		) as DuckSocket;
		socket.addEventListener('open', () => {
			// Announce arrival and request the current game state
			socket.send(
				JSON.stringify({
					type: MessageType.ARRIVAL_ANNOUNCEMENT,
					desiredPosition: playerRequest,
					playerName: $localStore.playerName
				} as ArrivalMessage)
			);
		});
		socket.addEventListener('message', (e) => {
			const message = JSON.parse(e.data) as BaseMessage;
			// Check to make sure game ID matches before handling
			if (message.gameId === data.gameId) {
				switch (message.type) {
					case MessageType.COMMUNICATION:
						break;
					case MessageType.GAME_STATE:
						const gameData = message as GameStateMessage;
						gameStore.updateState(gameData.state);
						gameStore.updateTurn(gameData.playerTurn);
						gameStore.updateForcedJumps(gameData.forcedJumps);
						if (gameData.winner != null) {
							gameStore.setWinner(gameData.winner, gameData.winReason);
						}
						break;
					case MessageType.BOARD_STATE:
						const boardData = message as BoardStateMessage;
						gameStore.updateTiles(boardData.tiles);
						localStore.updateTaken(boardData.tiles);
						break;
					case MessageType.ARRIVAL_RESPONSE:
						const arrivalData = message as ArrivalResponse;
						gameStore.updateState(arrivalData.state);
						gameStore.updateTurn(arrivalData.playerTurn);
						gameStore.updateTiles(arrivalData.tiles);
						gameStore.updatePlayers(arrivalData.players);
						gameStore.updateForcedJumps(arrivalData.forcedJumps);
						gameStore.updateGameName(arrivalData.gameName);
						gameStore.setWinner(arrivalData.winner, arrivalData.winReason);
						localStore.setPlayerPosition(arrivalData.playerPosition);
						localStore.updateTaken(arrivalData.tiles);
						console.log(`Connected to game ID: ${data.gameId} as ${$localStore.playerName}`);
						break;
					case MessageType.PLAYERS_UPDATE:
						const playerData = message as PlayerDataMessage;
						gameStore.updatePlayers(playerData.players);
						break;
					default:
						break;
				}
			} else {
				console.log(`Received unexpected game info from game ${message.gameId}.`);
			}
		});
	});

	const sendMessage = (e: Event) => {
		socket.send(
			JSON.stringify({
				message: fieldValue,
				type: MessageType.COMMUNICATION,
				sender: $localStore.playerName,
				time: new Date(),
				gameId: data.gameId
			} as CommunicationMessage)
		);
	};

	interface PlayerInfo {
		name: string;
		chipCount: number;
		colour: 'red' | 'black';
	}

	$: player = {
		name:
			($localStore.playerPosition === PlayerPosition.TWO
				? $gameStore?.players[PlayerPosition.TWO]?.playerName
				: $gameStore?.players[PlayerPosition.ONE]?.playerName) ?? 'Waiting for player',
		chipCount:
			$localStore.playerPosition === PlayerPosition.TWO
				? $localStore.taken[PlayerPosition.ONE]
				: $localStore.taken[PlayerPosition.TWO],
		colour: $localStore.playerPosition === PlayerPosition.TWO ? 'black' : 'red'
	} as PlayerInfo;
	$: opponent = {
		name:
			($localStore.playerPosition === PlayerPosition.TWO
				? $gameStore?.players[PlayerPosition.ONE]?.playerName
				: $gameStore?.players[PlayerPosition.TWO]?.playerName) ?? 'Waiting for player',
		chipCount:
			$localStore.playerPosition === PlayerPosition.TWO
				? $localStore.taken[PlayerPosition.TWO]
				: $localStore.taken[PlayerPosition.ONE],
		colour: $localStore.playerPosition === PlayerPosition.TWO ? 'red' : 'black'
	} as PlayerInfo;

	let dialog: HTMLDialogElement;
</script>

<div class="background">
	<div id="board-box">
		<div id="banner">
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
			<h2
				id="back"
				on:click={() => {
					goto('/');
				}}
			>
				←
			</h2>
			<GameStateBoard />
		</div>
		<h2 id="game-name">{$gameStore.gameName ?? 'Missing Game Name'}</h2>
		<div class="player-area">
			<PlayerCard name={opponent.name} chipCount={opponent.chipCount} colour={opponent.colour} />
		</div>
		<Board {socket} />
		<div class="player-area">
			<PlayerCard name={player.name} chipCount={player.chipCount} colour={player.colour} />
			{#if $localStore.playerPosition !== PlayerPosition.OBSERVER}<button
					id="forfeit"
					on:click={() => dialog.showModal()}>Forfeit</button
				>{/if}
		</div>
	</div>
</div>

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
		<span>Forfeit?</span>
		<button class="black-button" on:click={() => dialog.close()}>Cancel</button>
		<button
			class="red-button"
			on:click={() => {
				socket.send(
					JSON.stringify({
						type: MessageType.FORFEIT,
						requestor: $localStore.playerPosition
					})
				);
				dialog.close();
			}}>Confirm</button
		>
	</div>
</dialog>

<style lang="scss">
	:global(body) {
		background-color: #232327;
	}

	.background {
		display: flex;
		height: 90vh;
		flex-direction: column;
	}

	#board-box {
		display: block;
		width: 100%;
		height: 90vh;
		max-width: 500px;
		margin: 0 auto;
	}

	.player-area {
		width: 100%;
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
	}

		button {
		padding: 5px 10px;
		font-weight: bold;
		font-family: Geneva, Tahoma, sans-serif;
		background-color: aliceblue;
		border: none;
		border-radius: 5px;
	}

	button:hover {
		background-color: rgb(179, 209, 235);
	}

	#game-name {
		font-family: 'Chicle', serif;
		font-weight: 300;
		font-size: 2em;
		color: yellow;
		margin: 0 auto;
		margin-bottom: 0.5em;
	}

	#back {
		font-family: 'Chicle', serif;
		font-weight: 300;
		font-size: 2em;
		color: yellow;
		margin: 0;
		cursor: pointer;
		width: fit-content;
	}

	#forfeit {
		background-color: #232327;
		border: 1px solid white;
		color: white;
		border-radius: 4px;
		cursor: pointer;
		font-family: 'Atma', system-ui;
		font-weight: 500;
		height: fit-content;
		padding: 1em;
		&:hover {
			background-color: rgb(78, 78, 78);
		}
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
			font-family: 'Chicle', serif;
			font-weight: 300;
			font-size: 1.6em;
			margin: 0 auto;
		}

		button {
			cursor: pointer;
			font-family: 'Atma', system-ui;
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
			background-color: rgb(255, 103, 103);
			border: 1px solid white;
			color: black;
			border-radius: 4px;
			&:hover {
				background-color: rgb(141, 55, 55);
			}
		}
	}

	.dialog-background {
		width: 100vw;
		height: 100vh;
		background-color: rgba(255, 255, 255, 0.226);
	}

	#banner {
		display: flex;
		justify-content: space-between;
	}
</style>
