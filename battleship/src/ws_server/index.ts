import { WebSocketServer } from "ws";

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

const DB: RegReqData[] = [];

const w = new WebSocketServer({ port });

console.log(`WS server is running on ws://localhost:${port}`);

const handleMessage = (
  dIn: ArrayBuffer | Blob | Buffer | Buffer[],
  w: WebSocket
) => {
  const md: Message = JSON.parse(dIn.toString());
  const { type, data } = md;
  const handler: Record<MessageType, () => RegReqData> = {
    reg: () => {
      const d: RegReqData = JSON.parse(data);
      const error = DB.some((v) => v.name === d.name);
      const errorText = error ? `a user named ${d.name} already exists` : "";
      if (!error) DB.push(d);
      const reqD: RegResData = {
        name: d.name,
        index: DB.findIndex((v) => v.name === d.name),
        error,
        errorText,
      };
      const m: Message = {
        type: "reg",
        data: JSON.stringify(reqD),
        id: 0,
      };
      w.send(JSON.stringify(m));
      console.log(reqD);
      return d;
    },
    update_winners: () => JSON.parse(data),
    create_room: () => JSON.parse(data),
    add_user_to_room: () => JSON.parse(data),
    create_game: () => JSON.parse(data),
    update_room: () => JSON.parse(data),
    add_ships: () => JSON.parse(data),
    start_game: () => JSON.parse(data),
    attack: () => JSON.parse(data),
    randomAttack: () => JSON.parse(data),
    finish: () => JSON.parse(data),
  };
  try {
    const d = handler[type]();
    console.log(d, DB);
  } catch (e) {
    console.error("JSON data parse failed", e);
  }
};

w.on("connection", (w) => {
  console.log("WS handshake is complete");
  w.on("message", (d) => handleMessage(d, w));
});

const off = () => {
  console.log("WS server closed");
  w.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", off);
process.on("SIGTERM", off);
