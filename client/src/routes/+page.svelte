<script lang="ts">
	import { onMount } from 'svelte';
	import Board from '../components/Board.svelte';
  import gameStore, { type ITile } from '../stores/gameStore';
	import Tile from '../components/Tile.svelte';
	import type TileClass from '../classes/Tile';
  import { MessageType, type BaseMessage, type GameStateMessage, type BoardStateMessage } from '$lib/interfaces';
	import tileStore from '../stores/tileStore';
	import localStore from '../stores/localStore';

  let fieldValue = '';
  let socket: WebSocket;

	onMount(() => {
		// fetch('http://localhost:22222/api/ongoing').then((response) => {
		// 	console.log(response);
		// });
    socket = new WebSocket("ws://localhost:22222/123");
    socket.addEventListener("open", () => {
      console.log("Connected")
    })
    socket.addEventListener('message', (e) => {
      console.log(`Received: ${e.data.toString()}`);
      console.log(JSON.parse(e.data));
      const data = e.data as BaseMessage;
      // TODO: Check to make sure game ID matches before handling
      switch (data.type) {
        case MessageType.COMMUNICATION:
          break;
        case MessageType.GAME_STATE:
          const gameData = data as GameStateMessage;
          gameStore.replace(gameData.state);
          break;
        case MessageType.BOARD_STATE:
          const boardData = data as BoardStateMessage;
          tileStore.update(boardData.tiles);
          break;
        case MessageType.GAME_END:
          break;
        default:
          break;
      }
    })
	});

  const sendMessage = (e: Event) => {
    socket.send(fieldValue);
  }

  const sendMove = (tile: ITile) => {
    console.log(tile)
    socket.send(JSON.stringify({
      fromTile: $localStore.selectedTile,
      toTile: tile,
    }))
    gameStore.moveChip(tile);
  }

</script>

<div class="background">
  <input type="text" bind:value={fieldValue} />
  <button on:click={sendMessage}>Send</button>
	<Board sendMove={sendMove}/>
</div>

<style>
	:global(body) {
		background-color: #232327;
	}

	
</style>
