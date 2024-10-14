import { resolve } from "path";
import { createReadStream } from "fs";
import { createHash } from "crypto";
import { pipeline } from "stream";
import { stdout } from "process";
import { shared } from "../index.js";
import { PassThrough } from "stream";

export const hash = (p) => {
  const pT = new PassThrough();
  let h = "";
  pT.on("data", (c) => (h += c));
  pT.on("end", () => {
    console.log(h);
    shared.showCD();
  });
  pipeline(
    createReadStream(resolve(shared.dir, p)),
    createHash("sha256").setEncoding("hex"),
    pT,
    (e) => {
      if (e) console.error("Operation failed -", e.message);
    }
  );
};
