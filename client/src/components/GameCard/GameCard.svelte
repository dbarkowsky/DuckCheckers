<script lang="ts">
	import StaticBoard from './StaticBoard.svelte';
	import { goto } from '$app/navigation';
	import { type IGame } from '../../stores/gameStore';

	export let game: IGame;

	const handleJoinClick = (colour?: string) => {
		const params = new URLSearchParams({
			player: colour ?? ''
		});
		goto(`/game/${game._id}?${params.toString()}`);
	};

</script>

<div class="game-card">
	<h3>{game.gameName}</h3>
	<StaticBoard {game} />
	{#if !game.players[1]}<button on:click={() => handleJoinClick('red')}>Red</button>
	{:else}<span>{game.players[1].playerName}</span>{/if}
	<span>VS</span>
	{#if !game.players[2]}<button on:click={() => handleJoinClick('black')}>Black</button>
	{:else}<span>{game.players[2].playerName}</span>{/if}
	<br/>
	<button on:click={() => handleJoinClick()}>Observer</button>
</div>

<style>
	.game-card {
		display: block;
		width: 225px;
		border: white solid 2px;
		border-radius: 5%;
		padding: 1em;
		margin: 0.5em;
	}
</style>
