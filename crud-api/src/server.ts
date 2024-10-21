import { createServer } from "http";
import { User, UserRequiredFields, users } from "./db";
import { v4, validate } from "uuid";

export const server = createServer();

const c = { "Content-type": "application/json" };

server.on("request", (req, res) => {
  const { url, method } = req;

  try {
    if (method === "GET") {
      if (url === "/api/users") {
        res.writeHead(200, c);
        res.end(JSON.stringify(users));
      } else if (url?.match(/^\/api\/users\/[0-9a-fA-F-]+$/)) {
        const id = url.split("/")[3];
        if (validate(id)) {
          const user = users.find((u) => u.id === id);
          if (user) {
            res.writeHead(200, c);
            res.end(JSON.stringify(user));
          } else {
            res.writeHead(404, c);
            res.end(
              JSON.stringify({ message: `user with id ${id} doesn't exist` }),
            );
          }
        } else {
          res.writeHead(400, c);
          res.end(
            JSON.stringify({ message: `user id ${id} is invalid (not uuid)` }),
          );
        }
      } else {
        res.writeHead(404, { "Content-type": "application/json" });
        res.end(JSON.stringify({ message: `Sorry, such route doesn't exist` }));
      }
    } else if (method === "POST" && url === "/api/users") {
      let b = "";
      req.on("data", (c) => (b += c.toString()));
      req.on("end", () => {
        try {
          const bj: UserRequiredFields = JSON.parse(b);
          const { username, age, hobbies } = bj;
          const usernameIsValid =
            username === "" ? true : username && typeof username === "string";
          const ageIsValid = typeof age === "number";
          const hobbiesIsValid =
            Array.isArray(hobbies) &&
            hobbies.every((h) => typeof h === "string");
          if (usernameIsValid && ageIsValid && hobbiesIsValid) {
            users.push({ id: v4(), username, age, hobbies });
            res.writeHead(201, c);
            res.end(
              JSON.stringify({
                message: `user ${username} added successfully`,
              }),
            );
          } else {
            res.writeHead(400, c);
            res.end(
              JSON.stringify({
                message:
                  "the request body does not contain required fields or their type doesn't match the required ones",
              }),
            );
          }
        } catch (e) {
          res.writeHead(400, c);
          res.end(JSON.stringify({ error: "Invalid JSON" }));
        }
      });
    } else if (
      method === "PUT" &&
      url?.match(/^\/api\/users\/[0-9a-fA-F-]+$/)
    ) {
      let b = "";
      const id = url.split("/")[3];
      req.on("data", (c) => (b += c.toString()));
      req.on("end", () => {
        try {
          const bj: UserRequiredFields = JSON.parse(b);
          let { username, age, hobbies } = bj;
          const u = users.find((u) => u.id === id);
          if (u) {
            username =
              username === ""
                ? ""
                : (typeof username === "string" && username) || u.username;
            age = age === 0 ? 0 : (typeof age === "number" && age) || u.age;
            hobbies =
              (Array.isArray(hobbies) &&
                hobbies.every((h) => typeof h === "string") &&
                hobbies) ||
              u.hobbies;
            u.age = age;
            u.hobbies = hobbies;
            u.username = username;
            res.writeHead(200, c);
            res.end(
              JSON.stringify({
                message: `user ${username} updated successfully`,
              }),
            );
          } else if (!validate(id)) {
            res.writeHead(400, c);
            res.end(
              JSON.stringify({
                message: `user id ${id} is invalid (not uuid)`,
              }),
            );
          } else {
            res.writeHead(404, c);
            res.end(
              JSON.stringify({ message: `record with id ${id} doesn't exist` }),
            );
          }
        } catch (e) {
          res.writeHead(400, c);
          res.end(JSON.stringify({ error: "Invalid JSON" }));
        }
      });
    } else if (
      method === "DELETE" &&
      url?.match(/^\/api\/users\/[0-9a-fA-F-]+$/)
    ) {
      const id = url.split("/")[3];
      const i = users.findIndex((u) => u.id === id);
      if (!validate(id)) {
        res.writeHead(400, c);
        res.end(
          JSON.stringify({ message: `user ${id} is invalid (not uuid)` }),
        );
      } else if (i === -1) {
        res.writeHead(404, c);
        res.end(
          JSON.stringify({ message: `record with id ${id} doesn't exist` }),
        );
      } else {
        users.splice(i, 1);
        res.writeHead(204, c);
        res.end(
          JSON.stringify({
            message: `record with id ${id} is found and deleted`,
          }),
        );
      }
    } else {
      res.writeHead(404, { "Content-type": "application/json" });
      res.end(JSON.stringify({ message: `Sorry, such route doesn't exist` }));
    }
  } catch (error) {
    const e = error as Error;
    console.error("Internal server error:", e.message);
    res.writeHead(500, c);
    res.end(
      JSON.stringify({ error: "Internal server error", message: e.message }),
    );
  }
});