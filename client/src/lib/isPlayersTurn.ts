import localStore from '../stores/localStore';
import gameStore, { GameState } from '../stores/gameStore';
import { get } from 'svelte/store'

export const isPlayersTurn = () => {
  const game = get(gameStore);
  const local = get(localStore);
  return [GameState.PLAYER_MOVE, GameState.PLAYER_DUCK, GameState.PLAYER_CONTINUE].includes(game.state) && local.playerPosition === game.playerTurn;
};
