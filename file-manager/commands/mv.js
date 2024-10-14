import { resolve } from "path";
import { access, constants, createReadStream, createWriteStream, rm as remove, unlink } from "fs";
import { pipeline } from "stream";
import { shared } from "../index.js";

export const mv = (p1, p2) => {
  p1 = resolve(shared.dir, p1);
  p2 = resolve(shared.dir, p2);
  access(p2, constants.F_OK, (e) => {
    if (!e) {
      console.warn("Operation failed - target file already exist");
      shared.showCD();
    }
    else {
      pipeline(createReadStream(p1), createWriteStream(p2), (e) => {
        if (e) {
          console.error("Operation failed -", e.message);
          unlink(p2, (e) => {});
        }
        else
          remove(p1, (e) => {
            if (e) console.error("Operation failed -", e.message);
            shared.showCD();
          });
      });
    }
  });
};
