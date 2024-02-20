<script lang='ts'>
	import Tile from "./Tile.svelte";
	import game from "../stores/game";
</script>

<div id="board">
  {#each $game as row}
    <div class="row">
      {#each row as tile}
        <Tile isRed={tile.isRed} />
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
