import type { DuckSocket, GameState, ITile } from '../stores/gameStore';
import type { PlayerPosition } from '../stores/localStore';

export enum MessageType {
	COMMUNICATION = 0,
	GAME_STATE = 1,
	BOARD_STATE = 2,
	MOVE_REQUEST = 4,
	SELECTED_TILE = 5,
	DUCK_PLACEMENT = 6,
	ARRIVAL_ANNOUNCEMENT = 7,
	ARRIVAL_RESPONSE = 8,
	RESET = 9,
	FORFEIT = 10,
	PLAYERS_UPDATE = 11
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
	gameName: string | undefined;
	tiles: ITile[][];
	players: Record<number, DuckSocket | undefined>;
	forcedJumps?: Location[];
	winner?: PlayerPosition;
	winReason?: string;
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
	winner?: PlayerPosition;
	winReason?: string;
	forcedJumps?: Location[];
}

export interface BoardStateMessage extends BaseMessage {
	type: MessageType.BOARD_STATE;
	tiles: ITile[][];
}

export interface MoveRequestMessage extends BaseMessage {
	type: MessageType.MOVE_REQUEST;
	from: ITile;
	to: ITile;
}

export interface DuckMessage extends BaseMessage {
	type: MessageType.DUCK_PLACEMENT;
	tile: ITile;
}

export interface PlayerDataMessage extends BaseMessage {
	type: MessageType.PLAYERS_UPDATE;
	players: Record<number, DuckSocket | undefined>;
	observers?: DuckSocket[];
}

export interface ForfeitRequest extends BaseMessage {
	type: MessageType.FORFEIT;
	requestor: PlayerPosition;
}

export interface Location {
	x: number;
	y: number;
}
