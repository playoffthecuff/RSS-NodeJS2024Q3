# CRUD-API

This application is the result of the [task](https://github.com/AlreadyBored/nodejs-assignments/blob/main/assignments/crud-api/assignment.md) of the [Rolling Scopes School](https://rs.school/) [Node.js Course](https://rs.school/courses/nodejs).

It is a simple HTTP server that processes HTTP/1.1 requests with the GET, POST, PUT and DELETE methods.

## How to run

### Use LTS Node.js version 22.9.0 or higher

```bash
npm install
```

- In development mode:

```bash
npm run start:dev
```

- In production mode:

```bash
npm run start:dev
```

Then wait for the message to appear in the console: "the server is listening on port 4000".  
After which you can make requests to the server `http://localhost:4000/`:  

- Add user to DB:
  - **POST** request to `api/users` with body `{username: 'John', age: 14, hobbies: ['node js']}` for example.
  - Server should answer with `status code` **201** and newly created record
  Users are stored as `objects` that have following properties:
    - `id` — unique identifier (`string`, `uuid`) generated on server side
    - `username` — user's name (`string`, **required**)
    - `age` — user's age (`number`, **required**)
    - `hobbies` — user's hobbies (`array` of `strings` or empty `array`, **required**)
  - If request `body` does not contain **required** fields, Server should answer with `status code` **400** and corresponding message
- Get user(s) from DB:
  - **GET** request to `api/users` is used to get all persons
    - Server should answer with `status code` **200** and all users records
  - **GET** request to `api/users/{userId}`  
    - Server should answer with `status code` **200** and record with `id === userId` if it exists
    - Server should answer with `status code` **400** and corresponding message if `userId` is invalid (not `uuid`)
    - Server should answer with `status code` **404** and corresponding message if record with `id === userId` doesn't exist
- Update existing user:
  - **PUT**  request to `api/users/{userId}` is used to update existing user
    - Server should answer with `status code` **200** and updated record
    - Server should answer with `status code` **400** and corresponding message if `userId` is invalid (not `uuid`)
    - Server should answer with `status code` **404** and corresponding message if record with `id === userId` doesn't exist
- Delete existing user:
  - **DELETE**  request to `api/users/{userId}` is used to delete existing user from database
    - Server should answer with `status code` **204** if the record is found and deleted
    - Server should answer with `status code` **400** and corresponding message if `userId` is invalid (not `uuid`)
    - Server should answer with `status code` **404** and corresponding message if record with `id === userId` doesn't exist

Requests to non-existing endpoints (e.g. `some-non/existing/resource`) should be handled (server should answer with `status code` **404** and corresponding human-friendly message)
