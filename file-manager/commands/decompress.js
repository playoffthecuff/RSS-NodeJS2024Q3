import { resolve } from "path";
import { access, constants, createReadStream, createWriteStream, unlink } from "fs";
import { createBrotliDecompress } from "zlib";
import { pipeline } from "stream";
import { shared } from "../index.js";

export const decompress = (p1, p2) => {
  p1 = resolve(shared.dir, p1);
  p2 = resolve(shared.dir, p2);
  access(p2, constants.F_OK, (e) => {
    if (!e) {
      console.warn("Operation failed - target file already exist");
      shared.showCD();
    }
    else {
      const r = createReadStream(p1);
      const t = createBrotliDecompress();
      const w = createWriteStream(p2);
      pipeline(r, t, w, (e) => {
        if (e) {
          unlink(p2, (e) => {});
          console.error("Operation failed -", e.message);
        }
        shared.showCD();
      });
    }
  });
};
