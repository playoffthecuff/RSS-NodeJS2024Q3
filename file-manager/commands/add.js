import { resolve } from "path";
import { access, constants, writeFile } from "fs";
import { shared } from "../index.js";

export const add = (p) => {
  p = resolve(shared.dir, p);
  access(p, constants.F_OK, (e) => {
    if (!e) {
      console.warn("Operation failed - such file already exist");
      shared.showCD();
    }
    else
      writeFile(p, "", (e) => {
        if (e) console.error("Operation failed -", e.message);
        shared.showCD();
      });
  });
};
