<script lang="ts">
	import Tile from './Tile.svelte';
	import gameStore from '../stores/gameStore';
	import localStore, { PlayerPosition } from '../stores/localStore';
	export let socket: WebSocket;

	$: rotate = $localStore.playerPosition === PlayerPosition.TWO;
</script>

<div id="board" class:rotate>
	{#each $gameStore.tiles as row}
		<div class="row">
			{#each row as tile}
				<Tile {tile} {socket} />
			{/each}
		</div>
	{/each}
</div>

<style>
	#board {
		padding: 2%;
		background-color: rgba(245, 245, 245, 0.9);
		margin: 1em auto;
		width: 90%;
		height: fit-content;
		transition: 1s ease-in-out;
	}

	.row {
		display: flex;
		max-height: calc(100% / 8);
		max-width: 700px;
	}

	.rotate {
		transform: rotate(180deg);
	}
</style>
