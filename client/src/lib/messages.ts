import type { GameState, ITile } from '../stores/gameStore';
import type { PlayerPosition } from '../stores/localStore';

export enum MessageType {
	COMMUNICATION,
	GAME_STATE,
	BOARD_STATE,
	GAME_END,
	MOVE_REQUEST,
	SELECTED_TILE,
	DUCK_PLACEMENT,
	ARRIVAL_ANNOUNCEMENT,
	ARRIVAL_RESPONSE,
	RESET
}

export interface BaseMessage {
	type: MessageType;
	gameId: string;
}

export interface ArrivalMessage extends BaseMessage {
	type: MessageType.ARRIVAL_ANNOUNCEMENT;
	playerName: string;
	desiredPosition: PlayerPosition;
}

export interface ArrivalResponse extends BaseMessage {
	type: MessageType.ARRIVAL_RESPONSE;
	playerPosition: PlayerPosition;
	playerTurn: PlayerPosition;
	state: GameState;
	tiles: ITile[][];
}

export interface CommunicationMessage extends BaseMessage {
	type: MessageType.COMMUNICATION;
	message: string;
	sender: string;
	time: Date;
}

export interface GameStateMessage extends BaseMessage {
	type: MessageType.GAME_STATE;
	state: GameState;
	playerTurn: PlayerPosition;
}

export interface BoardStateMessage extends BaseMessage {
	type: MessageType.BOARD_STATE;
	tiles: ITile[][];
}

export interface GameEndMessage extends BaseMessage {
	type: MessageType.GAME_END;
	winner: string;
	state: GameState.GAME_END;
}

export interface MoveRequestMessage extends BaseMessage {
	type: MessageType.MOVE_REQUEST;
	from: ITile;
	to: ITile;
}

export interface SelectedTileMessage extends BaseMessage {
	type: MessageType.SELECTED_TILE;
	tile: ITile;
}

export interface DuckMessage extends BaseMessage {
	type: MessageType.DUCK_PLACEMENT;
	tile: ITile;
}
