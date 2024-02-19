<script lang='ts'>
	import Chip from "./Chip.svelte";

  const tiles = new Array(8).fill(new Array(8).fill(0));
</script>

<div id="board">
  {#each tiles as row, pindex}
    <div class="row">
      {#each row as tile, index}
        <div class={(pindex + index) % 2 == 0 ? 'red' : 'black'}><Chip colour='orange'/></div>
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

	.red {
		background-color: rgb(255, 103, 103);
	}

	.black {
		background-color: rgb(78, 78, 78);
	}

	.red,
	.black {
		display: inline-block;
		width: 100px;
		height: 100px;
	}
</style>
