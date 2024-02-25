<script lang="ts">
	import type TileClass from '../classes/Tile';
	import Chip from './Chip.svelte';
  import gameStore from '../stores/gameStore';
  import getPossibleMoves from '$lib/getPossibleMoves'

	export let tile: TileClass;
  export let onClick: () => void;

  let highlighted = false;

	const clickHandler = () => {
    if (tile.hasChip()){
      gameStore.setSelectedTile(tile);
      // Decide which tiles can be moved to
      gameStore.setPossibleMoves(getPossibleMoves(tile));
    } else if ($gameStore.currentTile) {
      if ($gameStore.possibleMoves.find((coord: number[]) => coord[0] === tile.x && coord[1] === tile.y)){
        gameStore.moveChip(tile);
      } else {
        gameStore.setSelectedTile(undefined);
      }
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
