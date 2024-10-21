import { createServer } from "http";
import "dotenv/config";
import { UserRequiredFields, users } from "./db";
import { v4, validate } from "uuid";

const port = process.env.PORT || 4000;

const server = createServer();

server.on("request", (req, res) => {
  const { url, method } = req;

  if (method === "GET") {
    if (url === "/api/users") {
      res.writeHead(200, { "Content-type": "application/json" });
      res.end(JSON.stringify(users));
    } else if (url?.match(/^\/api\/users\/[0-9a-fA-F-]+$/)) {
      const id = url.split("/")[3];
      if (validate(id)) {
        const user = users.find((u) => u.id === id);
        if (user) {
          res.writeHead(200, { "Content-type": "application/json" });
          res.end(JSON.stringify(user));
        } else {
          res.writeHead(404, { "Content-type": "application/json" });
          res.end(
            JSON.stringify({ message: "user with such id doesn't exist" }),
          );
        }
      } else {
        res.writeHead(400, { "Content-type": "application/json" });
        res.end(JSON.stringify({ message: "user id is invalid (not uuid)" }));
      }
    }
  } else if (method === "POST" && url === "/api/users") {
    let b = "";
    req.on("data", (c) => (b += c.toString()));
    req.on("end", () => {
      try {
        const bj: UserRequiredFields = JSON.parse(b);
        const { username, age, hobbies } = bj;
        const usernameIsValid = username && typeof username === "string";
        const ageIsValid = typeof age === "number";
        const hobbiesIsValid =
          Array.isArray(hobbies) && hobbies.every((h) => typeof h === "string");
        if (usernameIsValid && ageIsValid && hobbiesIsValid) {
          users.push({id: v4(), username, age, hobbies})
          res.writeHead(201, { "Content-type": "application/json" });
          res.end(
            JSON.stringify({ message: `user ${username} added successfully` }),
          );
        } else {
          res.writeHead(400, { "Content-type": "application/json" });
          res.end(JSON.stringify({ message: "request body does not contain required fields" }));
        }
      } catch (e) {
        res.writeHead(400, { "Content-type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
  } else {
    console.log("no match");
    res.writeHead(404, { "Content-type": "application/json" });
    res.end(JSON.stringify({}));
  }
});

server.listen(port);
server.on("listening", () =>
  console.log("the server is listening on port", port),
);
