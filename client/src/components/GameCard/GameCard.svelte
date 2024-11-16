<script lang="ts">
	import StaticBoard from './StaticBoard.svelte';
	import { goto } from '$app/navigation';
	import { type IGame } from '../../stores/gameStore';
	import { PlayerPosition } from '../../stores/localStore';

	export let game: IGame;

	const handleJoinClick = (colour?: string) => {
		const params = new URLSearchParams({
			player: colour ?? ''
		});
		goto(`/game/${game._id}?${params.toString()}`);
	};
</script>

<div class="game-card">
	<h3 id="game-name">{game.gameName}</h3>
	<StaticBoard {game} />
	{#if !game.players[PlayerPosition.TWO]}<button
			class="black-button"
			on:click={() => handleJoinClick('black')}>Join as Black</button
		>
	{:else}<span class="player-name black">{game.players[PlayerPosition.TWO].playerName}</span>{/if}
	<span class="vs-span">VS</span>
	{#if !game.players[PlayerPosition.ONE]}<button
			class="red-button"
			on:click={() => handleJoinClick('red')}>Join as Red</button
		>
	{:else}<span class="player-name red">{game.players[PlayerPosition.ONE].playerName}</span>{/if}
	<br />
	<button class="observer-button" on:click={() => handleJoinClick()}>Observe</button>
</div>

<style lang="scss">
	#game-name {
		font-family: 'Chicle', serif;
		font-weight: 400;
		color: yellow;
		margin: 0 auto;
	}

	.game-card {
		display: flex;
		flex-direction: column;
		width: 225px;
		border: white solid 2px;
		border-radius: 5%;
		padding: 1em;
		margin: 0.5em;
	}

	button {
		cursor: pointer;
		font-family: 'Atma', system-ui;
		font-weight: 500;
	}

	.vs-span {
		font-family: 'Atma', system-ui;
		color: yellow;
		margin: 0 auto;
	}

	.player-name {
		font-family: 'Atma', system-ui;
		margin: 0 auto;
	}

	.red {
		color: rgb(255, 103, 103);
	}

	.black {
		color: white;
	}

	.black-button {
		background-color: #232327;
		border: 1px solid white;
		color: white;
		border-radius: 4px;
		&:hover {
			background-color: rgb(78, 78, 78);
		}
	}

	.red-button {
		background-color: rgb(255, 103, 103);
		border: 1px solid white;
		color: black;
		border-radius: 4px;
		&:hover {
			background-color: rgb(141, 55, 55);
		}
	}

	.observer-button {
		margin-top: 0.5em;
	}
</style>
