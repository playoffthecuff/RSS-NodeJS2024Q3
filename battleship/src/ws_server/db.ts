import { WebSocket } from "ws";

export type MessageType =
  | "reg"
  | "update_winners"
  | "create_room"
  | "add_user_to_room"
  | "create_game"
  | "update_room"
  | "add_ships"
  | "start_game"
  | "attack"
  | "randomAttack"
  | "finish"
  | "turn";

  export type Message = {
  type: MessageType;
  id: 0;
  data: string;
};

export type RegReqData = {
  name: string;
  password: string;
};

export interface RegResData {
  name: string;
  index: number | string;
  error: boolean;
  errorText: string;
}

export type AddUserToRoomData = {
  indexRoom: number;
};

export type CreateGameData = {
  idGame: number | string;
  idPlayer: number | string;
};

export const players = new Map<WebSocket, RegReqData>();

export type RoomUser = {
  name: string;
  index: number;
};

export type RoomData = {
  roomId: number | string;
  roomUsers: RoomUser[];
};

export type WinnerData = {
  name: string;
  wins: number;
};

export type ShipType = "small" | "medium" | "large" | "huge";

export type ShipPosition = {
  x: number;
  y: number;
};

export type Ship = {
  position: ShipPosition;
  direction: boolean;
  length: number;
  type: ShipType;
};

export type ShipsData = {
  gameId: number;
  ships: Ship[];
  indexPlayer: number;
};

export type Cell = 0 | 1;
export type Row = Cell[];
export type GameMap = Row[];

export interface GameData extends ShipsData {
  gameMap: GameMap;
  myTurn: boolean;
}

export type StartGameData = {
  ships: Ship[];
  currentPlayerIndex: number;
};

export type AttackReqData = {
  gameId: number;
  x: number;
  y: number;
  indexPlayer: number;
};

export type Status = "miss" | "killed" | "shot";

export type AttackResData = {
  position: ShipPosition;
  currentPlayer: number;
  status: Status;
};

export type FinishData = {
  winPlayer: number;
};

export type Game = [GameData, GameData];

export const winners: WinnerData[] = [];
export const rooms: RoomData[] = [];
export const games: Game[] = [];