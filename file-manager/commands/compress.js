import { resolve } from "path";
import { access, constants, createReadStream, createWriteStream, unlink } from "fs";
import { createBrotliCompress } from "zlib";
import { pipeline } from "stream";
import { shared } from "../index.js";

export const compress = (p1, p2) => {
  p1 = resolve(shared.dir, p1);
  p2 = resolve(shared.dir, p2);
  access(p2, constants.F_OK, (e) => {
    if (!e) {
      console.warn("Operation failed - target file already exist");
      shared.showCD();
    }
    else {
      const r = createReadStream(p1);
      const t = createBrotliCompress();
      const w = createWriteStream(p2);
      pipeline(r, t, w, (e) => {
        if (e) {
          console.error("Operation failed -", e.message);
          unlink(p2, (e) => {});
        }
        shared.showCD();
      });
    }
  });
};
