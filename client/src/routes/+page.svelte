<script lang="ts">
	import { onMount } from 'svelte';
	import Board from '../components/Board.svelte';
  import gameStore, { GameState, type ITile } from '../stores/gameStore';
  import { MessageType, type BaseMessage, type GameStateMessage, type BoardStateMessage, type MoveRequestMessage } from '$lib/interfaces';
	import localStore, { PlayerNumber } from '../stores/localStore';

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
      // console.log(JSON.parse(e.data));
      const data = JSON.parse(e.data) as BaseMessage;
      // TODO: Check to make sure game ID matches before handling
      switch (data.type) {
        case MessageType.COMMUNICATION:
          break;
        case MessageType.GAME_STATE:
          const gameData = data as GameStateMessage;
          const updatedGame = {
            ...$gameStore,
            state: gameData.state,
          }
          gameStore.replace(updatedGame);
          break;
        case MessageType.BOARD_STATE:
          const boardData = data as BoardStateMessage;
          gameStore.updateTiles(boardData.tiles);
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
    socket.send(JSON.stringify({
      type: MessageType.MOVE_REQUEST,
      from: $localStore.selectedTile,
      to: tile,
    } as MoveRequestMessage))
  }

</script>

<div class="background">
  <input type="text" bind:value={fieldValue} />
  <button on:click={sendMessage}>Send</button>
  <br>
  <button on:click={() => {
    gameStore.updateState(GameState.PLAYER_MOVE)
  }}>PLAYER_MOVE</button>
  <button on:click={() => {
    gameStore.updateState(GameState.PLAYER_CONTINUE)
  }}>PLAYER_CONTINUE</button>
  <button on:click={() => {
    gameStore.updateState(GameState.PLAYER_DUCK)
  }}>PLAYER_DUCK</button>
  <button on:click={() => {
    gameStore.updateState(GameState.GAME_END)
  }}>GAME_END</button>
  <br>
  <button on:click={() => {
    localStore.setPlayer('one', PlayerNumber.ONE)
    gameStore.updateTurn(PlayerNumber.ONE)
  }}>PLAYER 1</button>
  <button on:click={() => {
    localStore.setPlayer('two', PlayerNumber.TWO)
    gameStore.updateTurn(PlayerNumber.TWO)
  }}>PLAYER 2</button>
  <button on:click={() => {
    gameStore.clearDuck();
  }}>CLEAR DUCK</button>
	<Board sendMove={sendMove}/>
</div>

<style>
	:global(body) {
		background-color: #232327;
	}

	
</style>
