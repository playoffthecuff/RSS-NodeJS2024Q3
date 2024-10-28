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

type Cell = 0 | 1;
type Row = Cell[];
type GameMap = Row[];

interface GameData extends ShipsData {
  gameMap: GameMap;
  myTurn: boolean;
}

type StartGameData = {
  ships: Ship[];
  currentPlayerIndex: number;
};

type AttackReqData = {
  gameId: number;
  x: number;
  y: number;
  indexPlayer: number;
};

type Status = "miss" | "killed" | "shot";

type AttackResData = {
  position: ShipPosition;
  currentPlayer: number;
  status: Status;
};

type FinishData = {
  winPlayer: number;
};

type Game = [GameData, GameData];

const winners: Winner[] = [];
const rooms: RoomData[] = [];
const games: Game[] = [];

const getX = (s: Ship) =>
  s.direction
    ? [s.position.x]
    : Array.from({ length: s.length }, (_, k) => s.position.x + k);
const getY = (s: Ship) =>
  s.direction
    ? Array.from({ length: s.length }, (_, k) => s.position.y + k)
    : [s.position.y];
const getC = (x: number[], y: number[]) => {
  const r: [number, number][] = [];
  for (const i of x) {
    for (const j of y) {
      r.push([i, j]);
    }
  }
  return r;
};

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
            myTurn: false,
            ships: [],
            gameMap: Array.from({ length: 10 }, () => Array(10).fill(0)),
          },
          {
            gameId: games.length,
            indexPlayer: index,
            myTurn: false,
            ships: [],
            gameMap: Array.from({ length: 10 }, () => Array(10).fill(0)),
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
        const g1 = g.find((v) => v.indexPlayer === d.indexPlayer);
        const g2 = g.find((v) => v.indexPlayer !== d.indexPlayer);
        if (g1) {
          g1.myTurn = true;
          g1.ships = d.ships;
        }
        if (g2) g2.myTurn = false;
        if (g.every((v) => v.ships.length)) {
          const d1: StartGameData = {
            currentPlayerIndex: g1?.indexPlayer ?? 1,
            ships: g1?.ships ?? [],
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
        const g = games.find((g) => g.some((v) => v.indexPlayer === p1i));
        // const r = rooms.find((r) => r.roomUsers.some((u) => u.index === p1i));
        // const p2i = r?.roomUsers.find((r) => r.index !== p1i)?.index ?? 0;
        const g1 = g?.find((v) => v.indexPlayer === p1i);
        const g2 = g?.find((v) => v.indexPlayer !== p1i);
        // const w = [...players.keys()][p2i];
        const w = [...players.keys()][g2?.indexPlayer ?? 0];
        const d = {
          currentPlayer: g1?.myTurn ? g2?.indexPlayer : g1?.indexPlayer,
        };
        const m: Message = {
          type: "turn",
          data: JSON.stringify(d),
          id,
        };
        ws.send(JSON.stringify(m));
        w.send(JSON.stringify(m));
      },
      attack() {
        const d: AttackReqData = JSON.parse(data);
        if (d.x === undefined || d.y === undefined) {
          d.x = ~~(Math.random() * 10);
          d.y = ~~(Math.random() * 10);
        }
        const g = games.find((g) => g[0].gameId === d.gameId);
        const g1 = g?.find((g) => g.indexPlayer === d.indexPlayer);
        const g2 = g?.find((g) => g.indexPlayer !== d.indexPlayer);
        if (!g2?.myTurn) return;
        if (g1) g1.myTurn = true;
        if (g2) {
          g2.gameMap[d.y][d.x] = 1;
          g2.myTurn = false;
        }
        const w = [...players.keys()][g2?.indexPlayer ?? 0];
        const ship: Ship | undefined = g2?.ships.find((s) => {
          const x = getX(s);
          const y = getY(s);
          return x.some((v) => v === d.x) && y.some((v) => v === d.y);
        });
        let status: Status = "miss";
        const surround: ShipPosition[] = [];
        const killed: ShipPosition[] = [];
        let end = false;
        if (ship) {
          if (g1) g1.myTurn = false;
          if (g2) g2.myTurn = true;
          const x = getX(ship);
          const y = getY(ship);
          const c = getC(x, y);
          status = c.every((v) => g2?.gameMap[v[1]][v[0]]) ? "killed" : "shot";
          if (status === "killed") {
            const s1: Ship = {
              direction: ship.direction,
              length: ship.length + 2,
              type: "huge",
              position: {
                x: ship.position.x - 1,
                y: ship.position.y - 1,
              },
            };
            const s2: Ship = {
              ...s1,
              position: {
                x: ship.position.x + (ship.direction ? 1 : -1),
                y: ship.position.y + (ship.direction ? -1 : 1),
              },
            };
            const s0x = getX(ship);
            const s0y = getY(ship);
            const c0 = getC(s0x, s0y);
            const s1x = getX(s1).filter((v) => v >= 0);
            const s1y = getY(s1).filter((v) => v >= 0);
            const c1 = getC(s1x, s1y);
            const s2x = getX(s2).filter((v) => v >= 0);
            const s2y = getY(s2).filter((v) => v >= 0);
            const c2 = getC(s2x, s2y);
            const h1x = ship.position.x + (ship.direction ? 0 : -1);
            const h2x = ship.position.x + (ship.direction ? 0 : ship.length);
            const h1y = ship.position.y + (ship.direction ? -1 : 0);
            const h2y = ship.position.y + (ship.direction ? ship.length : 0);
            const h = [
              [h1x, h1y],
              [h2x, h2y],
            ].filter((v) => v.every((v) => v >= 0));
            surround.push(
              ...c1.map((v) => ({ x: v[0], y: v[1] })),
              ...c2.map((v) => ({ x: v[0], y: v[1] })),
              ...h.map((v) => ({ x: v[0], y: v[1] }))
            );
            killed.push(...c0.map((v) => ({ x: v[0], y: v[1] })));
            end = g2.ships.every((s) => {
              const x = getX(s);
              const y = getY(s);
              const c = getC(x, y);
              return c.every((v) => g2.gameMap[v[1]][v[0]]);
            });
            console.log(end);
          }
        }
        const d1: AttackResData = {
          position: {
            x: d.x,
            y: d.y,
          },
          currentPlayer: d.indexPlayer,
          status,
        };
        const m1: Message = {
          type: "attack",
          data: JSON.stringify(d1),
          id,
        };
        ws.send(JSON.stringify(m1));
        w.send(JSON.stringify(m1));
        surround.forEach((v) => {
          const d2: AttackResData = {
            position: v,
            currentPlayer: d.indexPlayer,
            status: "miss",
          };
          const m2: Message = {
            ...m1,
            data: JSON.stringify(d2),
          };
          ws.send(JSON.stringify(m2));
          w.send(JSON.stringify(m2));
        });
        killed.forEach((v) => {
          const d0: AttackResData = {
            position: v,
            currentPlayer: d.indexPlayer,
            status: "killed",
          };
          const m0: Message = {
            ...m1,
            data: JSON.stringify(d0),
          };
          ws.send(JSON.stringify(m0));
          w.send(JSON.stringify(m0));
        });
        this.turn();
        if (end) {
          const dRes: FinishData = {
            winPlayer: d.indexPlayer,
          };
          const m: Message = {
            type: "finish",
            data: JSON.stringify(dRes),
            id,
          };
          ws.send(JSON.stringify(m));
          w.send(JSON.stringify(m));
        }
      },
      start_game() {},
      randomAttack() {
        this.attack();
      },
      finish() {},
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
