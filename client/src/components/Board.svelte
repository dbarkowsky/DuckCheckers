<script lang='ts'>
	import Tile from "./Tile.svelte";
	import type { ITile } from "../stores/gameStore";
	import gameStore from "../stores/gameStore";
	import localStore, { PlayerNumber } from "../stores/localStore";
	export let socket: WebSocket;

	$: rotate = $localStore.playerNumber === PlayerNumber.TWO;
</script>

<div id="board" class:rotate>
  {#each $gameStore.tiles as row}
    <div class="row">
      {#each row as tile}
        <Tile tile={tile} socket={socket}/>
      {/each}
    </div>
  {/each}
</div>

<style>
  #board {
		padding:2em;
		background-color: rgba(245, 245, 245, 0.9);
		margin: 2em auto;
    width: fit-content;
		min-width: 800px; 
		transition: 1s ease-in-out;
	}

	.row {
		height: 100px;
	}

	.rotate {
		transform: rotate(180deg);
	}
</style>
