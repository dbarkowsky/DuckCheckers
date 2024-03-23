<script lang='ts'>
	import Tile from "./Tile.svelte";
	import type { ITile } from "../stores/gameStore";
	import gameStore from "../stores/gameStore";
	export let sendMove: (tile: ITile) => void;

</script>

<div id="board">
  {#each $gameStore.tiles as row}
    <div class="row">
      {#each row as tile}
        <Tile tile={tile} sendMove={sendMove}/>
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
	}

	.row {
		height: 100px;
	}
</style>
