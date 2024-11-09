<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Board from '../../../components/Board.svelte';
	import gameStore, { GameState, type DuckSocket } from '../../../stores/gameStore';
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
	import getPossibleMoves from '$lib/getPossibleMoves';
	import { env } from '$env/dynamic/public';
	import { page } from '$app/stores';
	import PlayerCard from '../../../components/PlayerCard/PlayerCard.svelte';

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
            if (gameData.winner) {
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
						localStore.setPlayerPosition(arrivalData.playerPosition);
						localStore.updateTaken(arrivalData.tiles);
						console.log(`Connected to game ID: ${data.gameId} as ${$localStore.playerName}`);
						break;
					case MessageType.PLAYERS_UPDATE:
					const playerData = message as PlayerDataMessage;
						gameStore.updatePlayers(playerData.players)
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
</script>

<div class="background">
	<div class="side">
		<input type="text" bind:value={fieldValue} />
		<button on:click={sendMessage}>Send</button>
		<br />
		<h2 class="text">Choose colour:</h2>
		<button
			class={$localStore.playerPosition === PlayerPosition.ONE ? 'button-selected' : ''}
			on:click={() => {
				localStore.setPlayerPosition(PlayerPosition.ONE);
			}}>RED</button
		>
		<button
			class={$localStore.playerPosition === PlayerPosition.TWO ? 'button-selected' : ''}
			on:click={() => {
				localStore.setPlayerPosition(PlayerPosition.TWO);
			}}>BLACK</button
		>
		<h3 class="text">{$gameStore.playerTurn === 0 ? 'Red' : 'Black'}'s turn</h3>
		{#if $gameStore.state === GameState.PLAYER_MOVE}
			<h3 class="text">Move Chip</h3>
		{/if}
		{#if $gameStore.state === GameState.PLAYER_CONTINUE}
			<h3 class="text">Continue Jumping</h3>
		{/if}
		{#if $gameStore.state === GameState.PLAYER_DUCK}
			<h3 class="text">Place Duck</h3>
		{/if}
		<br />
    <p>{$gameStore.forcedJumps}</p>
		<button
			style="margin-top: 2em;"
			on:click={() => {
				socket.send(
					JSON.stringify({
						type: MessageType.RESET
					})
				);
			}}>Reset Game</button
		>
	</div>

	<div id="board-box">
		<h2>{$gameStore.gameName ?? 'Missing Game Name'}</h2>
		<div id="player-area">
			<PlayerCard
				name={$gameStore?.players[PlayerPosition.ONE]?.playerName}
				chipCount={$localStore.taken[PlayerPosition.TWO]}
				colour={'red'}
			/>
			<PlayerCard
				name={$gameStore?.players[PlayerPosition.TWO]?.playerName}
				chipCount={$localStore.taken[PlayerPosition.ONE]}
				colour={'black'}
			/>
		</div>
		<Board {socket} />
	</div>
</div>

<style>
	:global(body) {
		background-color: #232327;
	}

	.background {
		display: flex;
		height: 90vh;
	}

	#board-box {
		display: block;
		width: 100%;
		height: 100%;
	}

	#player-area {
		width: 100%;
		max-width: 700px;
		margin: 0 auto;
    display: flex;
    justify-content: space-between;
	}

	.side {
		max-width: 300px;
	}

	.text {
		color: white;
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

	.button-selected {
		background-color: rgb(127, 226, 165);
	}
</style>
