<script lang="ts">
	import type TileClass from '../classes/Tile';
	import Chip from './Chip.svelte';
  export let tile: TileClass;
</script>
<div class={tile.isRed ? 'red' : 'black'}>
  {#if tile.chip}
    <Chip colour={tile.chip.colour}/>
  {/if}
</div>

<style>
	.red {
		background-color: rgb(255, 103, 103);
	}

	.black {
		background-color: rgb(78, 78, 78);
	}

	.red,
	.black {
		display: table-cell;
		width: 100px;
		height: 100px;
	}
</style>
