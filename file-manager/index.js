import { argv, env, exit, stdin, stdout } from "process";
import readline from "readline";
import { dirname, resolve } from "path";
import { stat } from "fs";
import {
  ls,
  cat,
  add,
  rn,
  cp,
  mv,
  rm,
  os,
  hash,
  compress,
  decompress,
} from "./commands/index.js";
import { homedir } from "os";

export const shared = {
  dir: homedir(),
  showCD: () => console.info(`You are currently in ${shared.dir},`, `Enter command:`),
};

const userName = argv[2]?.startsWith("--username=")
  ? argv[2].split("=")[1]
  : env.npm_config_username
  ? env.npm_config_username
  : "Guest";

const rl = readline.createInterface({
  input: stdin,
  output: stdout,
});

const end = () => {
  console.log(`Thank you for using File Manager, ${userName}, goodbye!`);
  rl.close();
  exit(0);
};

const up = () => {
  shared.dir = dirname(shared.dir);
  shared.showCD();
};

export const cd = (p) => {
  stat(resolve(shared.dir, p), (e, s) => {
    if (e) console.error("Operation failed -", e.message);
    else if (!s.isDirectory())
      console.warn("Operation failed - destination isn't a directory");
    else shared.dir = resolve(shared.dir, p);
  });
  shared.showCD();
};

const commands = {
  ".exit": end,
  up,
  cd,
  ls,
  cat,
  add,
  rn,
  cp,
  mv,
  rm,
  os,
  hash,
  compress,
  decompress,
};

console.log(`Welcome to the File Manager, ${userName}!`);
shared.showCD();

rl.on("SIGINT", () => end());
rl.on("line", (i) => {
  i = i.trim();
  try {
    const cmd = i.replace(/ [\s\S]+/, "");
    commands[cmd]
      ? commands[cmd](...i.split(" ").slice(1))
      : console.warn("Invalid input");
  } catch (e) {
    console.warn("Operation failed");
    console.log(e);
  }
});
