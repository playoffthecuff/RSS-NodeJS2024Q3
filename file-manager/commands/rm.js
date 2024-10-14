import { resolve } from "path";
import {rm as remove} from "fs";
import { shared } from "../index.js";

export const rm = (p) => {
  remove(resolve(shared.dir, p), (e) => {
    if (e) console.error("Operation failed -", e.message);
    shared.showCD();
  });
};
