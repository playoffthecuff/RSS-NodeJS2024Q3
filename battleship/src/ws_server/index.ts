import { WebSocketServer } from "ws";

const port = 3000;

const w = new WebSocketServer({ port });

console.log(`WS server is running on ws://localhost:${port}`);

w.on("connection", (w) => {
  console.log("WS handshake is complete");
});

const off = () => {
  console.log("WS server closed");
  w.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", off);
process.on("SIGTERM", off);
