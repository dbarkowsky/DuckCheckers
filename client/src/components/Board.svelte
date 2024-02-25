<script lang='ts'>
	import Tile from "./Tile.svelte";
	import tileStore from "../stores/tileStore";

	const tileClickHandler = () => {
		console.log('hi')
	}
</script>

<div id="board">
  {#each $tileStore as row}
    <div class="row">
      {#each row as tile}
        <Tile tile={tile} onClick={tileClickHandler}/>
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
