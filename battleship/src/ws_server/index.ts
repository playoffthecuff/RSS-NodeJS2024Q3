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
  | "finish";

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
//       console.log([...players.values()])
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
//       console.log(reqD);
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

const winners: Winner[] = [];
const rooms: RoomData[] = [];
const games: RoomData[] = [];

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
        const reqD: RegResData = {
          name: d.name,
          index: [...players.values()].findIndex((v) => v.name === d.name),
          error,
          errorText,
        };
        const m: Message = {
          type: "reg",
          data: JSON.stringify(reqD),
          id: 0,
        };
        ws.send(JSON.stringify(m));
        this["update_room"]();
        this["update_winners"]();
        console.log(reqD);
      },

      update_winners() {
        const m: Message = {
          type: "update_winners",
          id: 0,
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
        games.push(r);
        this["update_room"]();
      },
      add_user_to_room() {
        const d: AddUserToRoomData = JSON.parse(data);
        rooms[d.indexRoom].roomUsers.push({
          name,
          index,
        });
        this["update_room"]();
        const p1ws = [...players.keys()][rooms[d.indexRoom].roomUsers[0].index];
        this["create_game"](p1ws);
      },
      create_game(w?: WebSocket) {
        const reqD: CreateGameData = {
          idGame: games.length - 1,
          idPlayer: index,
        };
        const m: Message = {
          type: "create_game",
          data: JSON.stringify(reqD),
          id: 0,
        };
        const ms = JSON.stringify(m);
        ws.send(ms);
        if (w) w.send(ms);
      },
      update_room() {
        const d = rooms.filter((r) => r.roomUsers.length === 1);
        const m: Message = {
          type: "update_room",
          data: JSON.stringify(d),
          id: 0,
        };
        [...players.keys()].forEach((w) => w.send(JSON.stringify(m)));
      },
      add_ships: () => JSON.parse(data),
      start_game: () => JSON.parse(data),
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
