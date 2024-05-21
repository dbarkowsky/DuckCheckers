<script lang="ts">
	import { onMount } from 'svelte';
	import Board from '../../../components/Board.svelte';
	import gameStore, { GameState, type IGame, type ITile } from '../../../stores/gameStore';
	import {
		MessageType,
		type BaseMessage,
		type GameStateMessage,
		type BoardStateMessage,
		type MoveRequestMessage,
		type SelectedTileMessage
	} from '$lib/messages';
	import localStore, { PlayerNumber } from '../../../stores/localStore';
	import getPossibleMoves from '$lib/getPossibleMoves';
	
	export let data;

	let fieldValue = '';
	let socket: WebSocket;

	onMount(() => {
		// fetch('http://localhost:22222/api/ongoing').then((response) => {
		// 	console.log(response);
		// });
		socket = new WebSocket(`ws://localhost:22222/${data.gameId}`);
		socket.addEventListener('open', () => {
			console.log(`Connected to game ID: ${data.gameId}`);
			// TODO: Request the current state of the board, game, etc.
		});
		socket.addEventListener('message', (e) => {
			// console.log(JSON.parse(e.data));
			const data = JSON.parse(e.data) as BaseMessage;
			// TODO: Check to make sure game ID matches before handling
			switch (data.type) {
				case MessageType.COMMUNICATION:
					break;
				case MessageType.GAME_STATE:
					const gameData = data as GameStateMessage;
          gameStore.updateState(gameData.state);
          gameStore.updateTurn(gameData.playerTurn);
					break;
				case MessageType.BOARD_STATE:
					const boardData = data as BoardStateMessage;
					gameStore.updateTiles(boardData.tiles);
					break;
				case MessageType.SELECTED_TILE:
					const selectedData = data as SelectedTileMessage;
					gameStore.updateState(GameState.PLAYER_CONTINUE);
					localStore.setSelectedTile(selectedData.tile);
					localStore.setPossibleMoves(getPossibleMoves(selectedData.tile, true));
				case MessageType.GAME_END:
					break;
				default:
					break;
			}
		});
	});

	const sendMessage = (e: Event) => {
		socket.send(fieldValue);
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
		<button
			on:click={() => {
				localStore.setPlayer('one', PlayerNumber.ONE);
			}}>PLAYER 1</button
		>
		<button
			on:click={() => {
				localStore.setPlayer('two', PlayerNumber.TWO);
			}}>PLAYER 2</button
		>

    <p class="text">Game state: {$gameStore.state}</p>
    <p class="text">Player Turn: {$gameStore.playerTurn}</p>
    <p class="text">You: {$localStore.playerNumber}</p>
    <p class="text">Selected: {JSON.stringify($localStore.selectedTile)}</p>
	</div>

	<Board {socket} />
</div>

<style>
	:global(body) {
		background-color: #232327;
	}

	.background {
		display: flex;
	}

	.side {
		max-width: 300px;
	}

  .text {
    color: white;
  }
</style>
