<script lang='ts'>
	import Chip from "./Chip.svelte";
	import Tile from "./Tile.svelte";

  const tiles = new Array(8).fill(new Array(8).fill(0));
</script>

<div id="board">
  {#each tiles as row, pindex}
    <div class="row">
      {#each row as tile, index}
        <Tile isRed={(pindex + index) % 2 == 0} />
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
