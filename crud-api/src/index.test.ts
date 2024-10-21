import request from "supertest";
import { server } from "./server";
import { User, UserRequiredFields } from "./db";

describe("API tests", () => {
  it("should return an empty array for GET /api/users", async () => {
    const response = await request(server).get("/api/users");
    expect(response.body).toEqual([]);
  });

  it("should create a new user with POST /api/users", async () => {
    const username = "John Doe";
    const age = 111;
    const hobbies: string[] = [];

    const u: UserRequiredFields = { username, age, hobbies };

    await request(server).post("/api/users").send(u);
    const updatedUsers = await request(server).get("/api/users");
    const found: User = updatedUsers.body.find(
      (u: User) =>
        u.age === age &&
        u.username === username &&
        u.hobbies.toString() === hobbies.toString(),
    );
    expect({
      username: found.username,
      age: found.age,
      hobbies: found.hobbies,
    }).toEqual(u);
  });

  it("should return the created user by ID with GET /api/users/{userId}", async () => {
    let r = await request(server).get("/api/users");
    const u: User = r.body[0];
    const { id } = u;
    r = await request(server).get(`/api/users/${id}`);
    expect(r.body.id).toBe(id);
  });
});
