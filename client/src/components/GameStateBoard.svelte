<script lang="ts">
	import gameStore, { GameState } from '../stores/gameStore';
	import { PlayerPosition } from '../stores/localStore';

	$: textToShow = () => {
		const player = $gameStore.playerTurn === PlayerPosition.ONE ? 'Red' : 'Black';
		switch ($gameStore.state) {
			case GameState.PLAYER_MOVE:
				return `${player} - Move`;
			case GameState.PLAYER_CONTINUE:
				return `${player} - Keep Going!`;
			case GameState.PLAYER_DUCK:
				return `${player} - Place Duck`;
			case GameState.GAME_END:
				// The player here is actually who won...
				return `${$gameStore.winner === PlayerPosition.ONE ? 'Red' : 'Black'} Wins!`;
		}
	};
</script>

<div id="container">
	<p>{textToShow()}</p>
	{#if $gameStore.winner != null}
		<p id="win-reason">{$gameStore.winReason}</p>
  {/if}
</div>

<style lang="scss">
	#container {
		height: 50px;
		width: fit-content;
		margin: 0 auto;
		margin-right: 0;
    padding: 1px 1em;
		border: 1px solid white;
		border-radius: 10px;
		transition: all 1s ease-in-out;
    display: flex;
    justify-content: flex-start;
    flex-direction: column;

		p {
			color: yellow;
			font-family: 'Chicle', serif;
			font-weight: 300;
			font-size: 1.6em;
      margin: auto;
		}

    #win-reason {
        font-size: 1em;
      }
	}
</style>
