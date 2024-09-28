<script lang="ts">
	import { onMount } from 'svelte';
	import Board from '../../../components/Board.svelte';
	import gameStore, { GameState, type IGame, type ITile } from '../../../stores/gameStore';
	import {
		MessageType,
		type BaseMessage,
		type GameStateMessage,
		type BoardStateMessage,
		type SelectedTileMessage,
		type ArrivalMessage,
		type ArrivalResponse,

		type CommunicationMessage

	} from '$lib/messages';
	import localStore, { PlayerPosition } from '../../../stores/localStore';
	import getPossibleMoves from '$lib/getPossibleMoves';
	import { env } from '$env/dynamic/public';
	import { page } from '$app/stores';

	export let data;

	let fieldValue = '';
	let socket: WebSocket;
	
	const playerRequestMap = (request: string | null) => {
		switch(request) {
			case 'red':
				return PlayerPosition.ONE;
			case 'black':
				return PlayerPosition.TWO;
			default:
				return PlayerPosition.OBSERVER;
		}
	}

	const playerRequest = playerRequestMap($page.url.searchParams.get('player'))
	onMount(() => {
		socket = new WebSocket(
			`ws://${env.PUBLIC_SERVER_URL}:${env.PUBLIC_SERVER_PORT}/${data.gameId}`
		);
		socket.addEventListener('open', () => {
			console.log(`Connected to game ID: ${data.gameId}`);
			// Announce arrival and request the current game state
			socket.send(
				JSON.stringify({
					type: MessageType.ARRIVAL_ANNOUNCEMENT,
					desiredPosition: playerRequest,
					player: $localStore.playerName || 'joe'
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
						break;
					case MessageType.BOARD_STATE:
						const boardData = message as BoardStateMessage;
						gameStore.updateTiles(boardData.tiles);
						break;
					case MessageType.SELECTED_TILE:
						const selectedData = message as SelectedTileMessage;
						gameStore.updateState(GameState.PLAYER_CONTINUE);
						localStore.setSelectedTile(selectedData.tile);
						localStore.setPossibleMoves(getPossibleMoves(selectedData.tile, true));
					case MessageType.ARRIVAL_RESPONSE:
						const arrivalData = message as ArrivalResponse;
						gameStore.updateState(arrivalData.state);
						gameStore.updateTurn(arrivalData.playerTurn);
						gameStore.updateTiles(arrivalData.tiles);
						localStore.setPlayerPosition(arrivalData.playerPosition);
						if (arrivalData.playerPosition !== undefined)
							localStore.setPlayerPosition(arrivalData.playerPosition);
						break;
					case MessageType.GAME_END:
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
		socket.send(JSON.stringify({
			message: fieldValue,
			type: MessageType.COMMUNICATION,
			sender: $localStore.playerName,
			time: new Date(),
			gameId: data.gameId,
		} as CommunicationMessage));
	};
</script>

<div class="background">
	<div class="side">
		<input type="text" bind:value={fieldValue} />
		<button on:click={sendMessage}>Send</button>
		<br />
		<!-- <button
			on:click={() => {
				gameStore.updateState(GameState.PLAYER_MOVE);
			}}>PLAYER_MOVE</button
		>
		<button
			on:click={() => {
				gameStore.updateState(GameState.PLAYER_CONTINUE);
			}}>PLAYER_CONTINUE</button
		>
		<button
			on:click={() => {
				gameStore.updateState(GameState.PLAYER_DUCK);
			}}>PLAYER_DUCK</button
		>
		<button
			on:click={() => {
				gameStore.updateState(GameState.GAME_END);
			}}>GAME_END</button
		> -->
		<br />
		<h2 class="text">Choose colour:</h2>
		<button
			class="{$localStore.playerPosition === PlayerPosition.ONE ? 'button-selected' : ''}"
			on:click={() => {
				localStore.setPlayerPosition(PlayerPosition.ONE);
			}}>RED</button
		>
		<button
			class="{$localStore.playerPosition === PlayerPosition.TWO ? 'button-selected' : ''}"
			on:click={() => {
				localStore.setPlayerPosition(PlayerPosition.TWO);
			}}>BLACK</button
		>

		<!-- <p class="text">Game state: {$gameStore.state}</p>
		<p class="text">Player Turn: {$gameStore.playerTurn}</p>
		<p class="text">You: {$localStore.playerNumber}</p>
		<p class="text">Selected: {JSON.stringify($localStore.selectedTile)}</p> -->
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
		<br>
		<button
			style="margin-top: 2em;"
			on:click={() => {
				socket.send(
				JSON.stringify({
					type: MessageType.RESET,
				})
			);
			}}>Reset Game</button
		>
	</div>

	<Board {socket} />
</div>

<style>
	:global(body) {
		background-color: #232327;
	}

	.background {
		display: flex;
		height: 100vh;
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
