import { resolve } from "path";
import { access, constants, rename } from "fs";
import { shared } from "../index.js";

export const rn = (p, n) => {
  n = resolve(shared.dir, n);
  access(n, constants.F_OK, (e) => {
    if (!e) {
      console.warn("Operation failed - target file already exist");
      shared.showCD();
    }
    else
      rename(resolve(shared.dir, p), resolve(shared.dir, n), (e) => {
        if (e) console.error("Operation failed -", e.message);
        shared.showCD();
      });
  });
};
