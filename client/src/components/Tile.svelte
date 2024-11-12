<script lang="ts">
	import Chip from './Chip.svelte';
	import localStore, { PlayerPosition } from '../stores/localStore';
	import getPossibleMoves from '$lib/getPossibleMoves';
	import crownSVG from '../assets/crown.svg';
	import type { ITile } from '../stores/gameStore';
	import { isPlayersTurn } from '$lib/isPlayersTurn';
	import gameStore, { GameState } from '../stores/gameStore';
	import { MessageType, type DuckMessage, type MoveRequestMessage } from '$lib/messages';
	import duckWithKnife from '../assets/duckWithKnife.svg';

	export let tile: ITile;
	export let socket: WebSocket;

	$: highlighted =
		$localStore.possibleMoves?.find((value) => value.x === tile.x && value.y === tile.y) ||
		($localStore.isHovered?.x === tile.x && $localStore.isHovered?.y === tile.y);

	$: hasForcedJump = $gameStore.forcedJumps?.find(
		(value) => value.x === tile.x && value.y === tile.y
	);

	const isPossibleMove = () =>
		!!$localStore.possibleMoves.find(
			(coord: { x: number; y: number }) => coord.x === tile.x && coord.y === tile.y
		);

	const sendMove = (tile: ITile) => {
		socket.send(
			JSON.stringify({
				type: MessageType.MOVE_REQUEST,
				from: $localStore.selectedTile,
				to: tile
			} as MoveRequestMessage)
		);
	};

	const sendDuckPlacement = (tile: ITile) => {
		socket.send(
			JSON.stringify({
				type: MessageType.DUCK_PLACEMENT,
				tile: tile
			} as DuckMessage)
		);
	};

	const clickHandler = () => {
		if (isPlayersTurn()) {
			console.log('click', $gameStore, $localStore);
			const isThisPlayersChip = tile.chip && tile.chip.player === $localStore.playerPosition;
			const isInForcedJumps = Boolean(
				$gameStore.forcedJumps?.find((location) => location.x === tile.x && location.y === tile.y)
			);
			const restrictedByForcedJump = $gameStore.forcedJumps?.length ? !isInForcedJumps : false;
			switch ($gameStore.state) {
				case GameState.PLAYER_MOVE:
					if (isThisPlayersChip && !restrictedByForcedJump) {
						localStore.setSelectedTile(tile);
						// Decide which tiles can be moved to
						if (isInForcedJumps) {
							localStore.setPossibleMoves(getPossibleMoves(tile, true));
						} else {
							localStore.setPossibleMoves(getPossibleMoves(tile));
						}
					} else if ($localStore.selectedTile) {
						if (isPossibleMove()) {
							sendMove(tile);
						}
						localStore.setSelectedTile(undefined);
					}
					break;
				case GameState.PLAYER_CONTINUE:
					// Selected tile here should be set by server
					if (isThisPlayersChip && !restrictedByForcedJump) {
						console.log('setting selected tile');
						localStore.setSelectedTile(tile);
						// Decide which tiles can be moved to
						localStore.setPossibleMoves(getPossibleMoves(tile, true));
					} else if ($localStore.selectedTile) {
						console.log('moving tile');
						if (isPossibleMove()) {
							sendMove(tile);
						}
						localStore.setSelectedTile(undefined);
					}

					break;
				case GameState.PLAYER_DUCK:
					// No chip is already here
					if (!tile.chip) {
						sendDuckPlacement(tile);
					}
					break;
				case GameState.GAME_END:
					break;
			}
		}
	};

	const shouldHighlightOnHover = () => {
		return (
			tile.chip &&
			tile.chip.player === $localStore.playerPosition &&
			$localStore.playerPosition === $gameStore.playerTurn &&
			$gameStore.state === GameState.PLAYER_MOVE
		);
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class:highlighted
	class:hasForcedJump
	class={tile.isRed ? 'red' : 'black'}
	on:click={clickHandler}
	on:mouseenter={() => {
		if (shouldHighlightOnHover()) {
			localStore.setIsHovered({
				x: tile.x,
				y: tile.y
			});
		}
	}}
	on:mouseleave={() => {
		if (tile.chip) {
			localStore.setIsHovered(undefined);
		}
	}}
>
	{#if tile.chip}
		<Chip
			colour={tile.chip.colour}
			rotate={$localStore.playerPosition === PlayerPosition.TWO}
		>
			{#if tile.chip.isKinged}
				<img class="crown" src={crownSVG} alt="crown" />
			{/if}
			{#if tile.chip.player === PlayerPosition.DUCK}
				<img class="duck" src={duckWithKnife} alt="duck" />
			{/if}
		</Chip>
	{/if}
</div>

<style lang="scss">
	.red {
		background-color: rgb(255, 103, 103);
	}

	.black {
		background-color: rgb(78, 78, 78);
	}

	.red,
	.black {
		display: flex;
		width: calc(100% / 8);
		aspect-ratio: 1 / 1;
		justify-content: center;
		align-items: center;
	}

	.highlighted {
		background-color: yellow;
	}

	.hasForcedJump {
		animation: flashing 2s infinite linear;
	}

	@keyframes flashing {
		50% {
			background-color: yellow;
		}
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
