<script lang="ts">
	import Chip from './../Chip.svelte';
	import { PlayerNumber } from '../../stores/localStore';
	import crownSVG from '../../assets/crown.svg';
	import duckWithKnife from '../../assets/duckWithKnife.svg'
	import type { ITile } from '../../stores/gameStore';

	export let tile: ITile;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class={tile.isRed ? 'red' : 'black'}
>
	{#if tile.chip}
		<Chip
			colour={tile.chip.colour}
		>
			{#if tile.chip.isKinged}
				<img class="crown" src={crownSVG} alt="crown" />
			{/if}
			{#if tile.chip.player === PlayerNumber.DUCK}
				<img class="duck" src={duckWithKnife} alt="duck" />
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
		display: flex;
		width: calc(100%/8);
		aspect-ratio: 1 / 1;
		justify-content: center;
		align-items: center;
	}

	.crown {
		width: 80%;
		display: inline-block;
	}

	.duck {
		width: 70%;
		display: inline-block;
	}
</style>
