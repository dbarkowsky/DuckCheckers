<script lang="ts">
	import Chip from './Chip.svelte';
  import localStore from '../stores/localStore';
  import getPossibleMoves from '$lib/getPossibleMoves'
  import crownSVG from '../assets/crown.svg';
	import type { ITile } from '../stores/gameStore';

	export let tile: ITile;
  export let sendMove: (tile: ITile) => void;

  $: highlighted = $localStore.possibleMoves.find((value) => value.x === tile.x && value.y === tile.y) || $localStore.isHovered?.x === tile.x && $localStore.isHovered?.y === tile.y;;

  const isPossibleMove = () => !!$localStore.possibleMoves.find((coord: {x: number, y: number}) => coord.x === tile.x && coord.y === tile.y)

	const clickHandler = () => {
    if (tile.chip){
      localStore.setSelectedTile(tile);
      // Decide which tiles can be moved to
      localStore.setPossibleMoves(getPossibleMoves(tile));
    } else if ($localStore.selectedTile) {
      if (isPossibleMove()){
        sendMove(tile);
      } 
      localStore.setSelectedTile(undefined);
    }
  };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class:highlighted class={tile.isRed ? 'red' : 'black'} on:click={clickHandler} on:mouseenter={() => {
  if (tile.chip){
    localStore.setIsHovered({
      x: tile.x,
      y: tile.y
    })
  }
}}
  on:mouseleave={() => {
    if(tile.chip){
      localStore.setIsHovered(undefined);
    }
  }}>
	{#if tile.chip}
		<Chip colour={tile.chip.colour} >
    {#if tile.chip.isKinged}
      <img class="crown" src={crownSVG} alt="crown"/>
    {/if}
  </Chip>
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

  .crown {
    width: 80%;
    position: absolute;
    top: 10px;
    left: 8px;
    display: inline-block;
  }
</style>
