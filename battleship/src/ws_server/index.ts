import { WebSocketServer, WebSocket } from "ws";

const port = 3000;
const id = 0;

type MessageType =
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

type Message = {
  type: MessageType;
  id: 0;
  data: string;
};

type RegReqData = {
  name: string;
  password: string;
};

interface RegResData {
  name: string;
  index: number | string;
  error: boolean;
  errorText: string;
}

type AddUserToRoomData = {
  indexRoom: number;
};

type CreateGameData = {
  idGame: number | string;
  idPlayer: number | string;
};

// type WinnerData = {
//   name: string;
//   wins: number;
// };

const players = new Map<WebSocket, RegReqData>();
// const winners: WinnerData[] [];

const w = new WebSocketServer({ port });

console.log(`WS server is running on ws://localhost:${port}`);

// const handleMessage = (
//   dIn: ArrayBuffer | Blob | Buffer | Buffer[],
//   w: WebSocket
// ) => {
//   const md: Message = JSON.parse(dIn.toString());
//   const { type, data } = md;
//   const handler: Record<MessageType, () => void> = {

//     reg: () => {
//       const d: RegReqData = JSON.parse(data);
//       // const error = DB.some((v) => v.name === d.name);
//       const error = players.has(w);
//       const errorText = error ? `a user named ${d.name} already exists` : "";
//       // if (!error) DB.push(d);
//       if (!error) players.set(w, d);
//       const reqD: RegResData = {
//         name: d.name,
//         // index: DB.findIndex((v) => v.name === d.name),
//         index: [...players.values()].findIndex(v => v.name === d.name),
//         error,
//         errorText,
//       };
//       const m: Message = {
//         type: "reg",
//         data: JSON.stringify(reqD),
//         id: 0,
//       };
//       w.send(JSON.stringify(m));
//     },

//     update_winners: () => JSON.parse(data),
//     create_room: () => {
//       // w.
//       // const reqD: CreateGameData = {
//       //   idGame:
//       // }
//     },
//     add_user_to_room: () => JSON.parse(data),
//     create_game: () => JSON.parse(data),
//     update_room: () => JSON.parse(data),
//     add_ships: () => JSON.parse(data),
//     start_game: () => JSON.parse(data),
//     attack: () => JSON.parse(data),
//     randomAttack: () => JSON.parse(data),
//     finish: () => JSON.parse(data),
//   };
//   try {
//     handler[type]();
//   } catch (e) {
//     console.error("JSON data parse failed", e);
//   }
// };

type RoomUser = {
  name: string;
  index: number;
};

type RoomData = {
  roomId: number | string;
  roomUsers: RoomUser[];
};

type Winner = {
  name: string;
  wins: number;
};

type ShipType = "small" | "medium" | "large" | "huge";

type ShipPosition = {
  x: number;
  y: number;
};

type Ship = {
  position: ShipPosition;
  direction: boolean;
  length: number;
  type: ShipType;
};

type ShipsData = {
  gameId: number;
  ships: Ship[];
  indexPlayer: number;
};

type StartGameData = {
  ships: Ship[];
  currentPlayerIndex: number;
};

type Game = [ShipsData, ShipsData];

const winners: Winner[] = [];
const rooms: RoomData[] = [];
const games: Game[] = [];

w.on("connection", (ws) => {
  console.log("WS handshake is complete");
  ws.on("message", (dIn) => {
    const md: Message = JSON.parse(dIn.toString());
    const { type, data } = md;
    const p = players.get(ws);
    const name = p?.name ?? "";
    const index = [...players.values()].findIndex((v) => v.name === p?.name);
    const handler: Record<MessageType, (w?: WebSocket) => void> = {
      reg() {
        const d: RegReqData = JSON.parse(data);
        const error = [...players.values()].some((v) => v.name === d.name);
        const errorText = error ? `a user named ${d.name} already exists` : "";
        if (!error) players.set(ws, d);
        const resD: RegResData = {
          name: d.name,
          index: [...players.values()].findIndex((v) => v.name === d.name),
          error,
          errorText,
        };
        const m: Message = {
          type: "reg",
          data: JSON.stringify(resD),
          id,
        };
        ws.send(JSON.stringify(m));
        this["update_room"]();
        this["update_winners"]();
      },

      update_winners() {
        const m: Message = {
          type: "update_winners",
          id,
          data: JSON.stringify(winners),
        };
        [...players.keys()].forEach((w) => w.send(JSON.stringify(m)));
      },
      create_room() {
        const r: RoomData = {
          roomId: rooms.length,
          roomUsers: [
            {
              name,
              index,
            },
          ],
        };
        rooms.push(r);
        this["update_room"]();
      },
      add_user_to_room() {
        const d: AddUserToRoomData = JSON.parse(data);
        rooms[d.indexRoom].roomUsers.push({
          name,
          index,
        });
        this["update_room"]();
        const p1i = rooms[d.indexRoom].roomUsers[0].index;
        const p1ws = [...players.keys()][p1i];
        const g: Game = [
          {
            gameId: games.length,
            indexPlayer: p1i,
            ships: [],
          },
          {
            gameId: games.length,
            indexPlayer: index,
            ships: [],
          },
        ];
        games.push(g);
        this["create_game"](p1ws);
      },
      create_game(w?: WebSocket) {
        const i = [...players.keys()].findIndex((v) => v === w);
        const d1: CreateGameData = {
          idGame: games.length - 1,
          idPlayer: index,
        };
        const d2: CreateGameData = {
          idGame: games.length - 1,
          idPlayer: i,
        };
        const m1: Message = {
          type: "create_game",
          data: JSON.stringify(d1),
          id,
        };
        const m2: Message = {
          ...m1,
          data: JSON.stringify(d2),
        };
        ws.send(JSON.stringify(m1));
        if (w) w.send(JSON.stringify(m2));
      },
      update_room() {
        const d = rooms.filter((r) => r.roomUsers.length === 1);
        const m: Message = {
          type: "update_room",
          data: JSON.stringify(d),
          id,
        };
        [...players.keys()].forEach((w) => w.send(JSON.stringify(m)));
      },
      add_ships() {
        const d: ShipsData = JSON.parse(data);
        const g = games[d.gameId];
        const p1 = g.find((v) => v.indexPlayer === d.indexPlayer);
        if (p1) p1.ships = d.ships;
        if (g.every((v) => v.ships.length)) {
          const d1: StartGameData = {
            currentPlayerIndex: p1?.indexPlayer ?? 1,
            ships: p1?.ships ?? [],
          };
          const p2 = g.find((v) => v.indexPlayer !== d.indexPlayer);
          const d2: StartGameData = {
            currentPlayerIndex: p2?.indexPlayer ?? 0,
            ships: p2?.ships ?? [],
          };
          const m1: Message = {
            type: "start_game",
            data: JSON.stringify(d1),
            id,
          };
          const m2: Message = {
            ...m1,
            data: JSON.stringify(d2),
          };
          ws.send(JSON.stringify(m1));
          const w = [...players.keys()][p2?.indexPlayer ?? 0];
          w.send(JSON.stringify(m2));
          this.turn();
        }
      },
      turn() {
        const p1i = [...players.keys()].findIndex((w) => w === ws);
        const r = rooms.find((r) => r.roomUsers.some((u) => u.index === p1i));
        const p2i = r?.roomUsers.find(r => r.index !== p1i)?.index ?? 0;
        const w = [...players.keys()][p2i];
        const td1 = {
          currentPlayer: p1i,
        };
        const td2 = {
          currentPlayer: p2i,
        };
        const tm1: Message = {
          type: "turn",
          data: JSON.stringify(td1),
          id,
        };
        const tm2: Message = {
          ...tm1,
          data: JSON.stringify(td2),
        };
        ws.send(JSON.stringify(tm1));
        w.send(JSON.stringify(tm2));
      },
      attack: () => JSON.parse(data),
      randomAttack: () => JSON.parse(data),
      finish: () => JSON.parse(data),
    };
    try {
      handler[type]();
    } catch (e) {
      console.error("JSON data parse failed", e);
    }
  });
});

const off = () => {
  console.log("WS server closed");
  w.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", off);
process.on("SIGTERM", off);
