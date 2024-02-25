<script lang="ts">
	import type TileClass from '../classes/Tile';
	import Chip from './Chip.svelte';
  import gameStore from '../stores/gameStore';

	export let tile: TileClass;
  export let onClick: () => void;

  let highlighted = false;

	const clickHandler = () => {
    if (tile.hasChip()){
      gameStore.setSelectedTile(tile);
      console.log($gameStore.currentTile)
    } else if ($gameStore.currentTile) {
      gameStore.moveChip(tile);
    }

    onClick();
  };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class:highlighted class={tile.isRed ? 'red' : 'black'} on:click={clickHandler} on:mouseenter={() => {
  if (tile.chip){
    highlighted = true;
  }
}}
  on:mouseleave={() => {
    highlighted = false;
  }}>
	{#if tile.chip}
		<Chip colour={tile.chip.colour} />
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

  .highlighted {
    background-color: yellow;
  }
</style>
