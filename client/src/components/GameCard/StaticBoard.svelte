<script lang='ts'>
	import type { IGame } from "../../stores/gameStore";
	import StaticTile from "./StaticTile.svelte";

	export let game: IGame;
</script>

<div id="board">
  {#each game.tiles as row}
    <div class="row">
      {#each row as tile}
        <StaticTile tile={tile} />
      {/each}
    </div>
  {/each}
</div>

<style>
  #board {
		padding: 2%;
		background-color: rgba(245, 245, 245, 0.9);
		margin: 2em auto;
    width: 90%;
		max-width: 800px;
		height: fit-content;
		transition: 1s ease-in-out;
    position: relative;
	}

	.row {
		display: flex;
		max-height: calc(90vh/8);
		max-width: 800px;
	}
</style>
