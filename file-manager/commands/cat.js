import { resolve } from "path";
import { createReadStream, stat } from "fs";
import { EOL } from "os";
import { shared } from "../index.js";
import { stdout } from "process";

export const cat = (p) => {
  p = resolve(shared.dir, p);
  stat(resolve(p), (e, s) => {
    if (e) {
      console.error("Operation failed -", e.message);
      shared.showCD();
    }
    else if (!s.isFile())
      console.warn("Operation failed - destination isn't a file");
    else {
      const i = createReadStream(p);
      i.pipe(stdout);
      i.on("error", (e) => {
        console.error("Operation failed -", e.message);
      });
      i.on("end", () => {
        console.log(EOL);
        shared.showCD();
      });
    }
  });
};
