import "dotenv/config";
import { server } from "./server";

const port = process.env.PORT;

server.listen(port);
server.on("listening", () =>
  console.log("the server is listening on port", port),
);
