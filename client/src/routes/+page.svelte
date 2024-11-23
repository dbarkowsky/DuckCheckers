<script lang="ts">
	import { onMount } from 'svelte';
	import type { IGame } from '../stores/gameStore';
	import GameCard from '../components/GameCard/GameCard.svelte';
	import NavBar from '../components/NavBar.svelte';
	import { constructApiUrl } from '$lib/constructApiUrl';

	let games: IGame[] = [];
	onMount(async () => {
		const response = await fetch(
			`${constructApiUrl()}/api/ongoing`,
			{
				method: 'GET'
			}
		);
		games = await response.json();
	});
</script>

<div class="background">
	<NavBar />
	<div class="game-area">
		{#each games as game}
			<GameCard {game} />
		{/each}
	</div>
</div>

<style>
	:global(body) {
		background-color: #232327;
	}

	.background {
		width: 100%;
		max-width: 900px;
		min-width: 350px;
		margin: 0 auto;
	}

	.game-area {
		justify-content: space-around;
		display: flex;
		flex-wrap: wrap;
		padding-top: 50px;
	}
</style>
