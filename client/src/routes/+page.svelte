<script lang="ts">
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';
	import type { IGame } from '../stores/gameStore';
	import GameCard from '../components/GameCard/GameCard.svelte';

	let games: IGame[] = [];
	onMount(async () => {
		const response = await fetch(
			`http://${env.PUBLIC_SERVER_URL}:${env.PUBLIC_SERVER_PORT}/api/ongoing`,
			{
				method: 'GET'
			}
		);
		games = await response.json();
	});
</script>

<div class="background">
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
		margin: 0 auto;
	}

	.game-area { 
		justify-content: space-around;
		display: flex;
		flex-wrap: wrap;
	}
</style>
