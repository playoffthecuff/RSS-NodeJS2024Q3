import { readdir } from "fs";
import { shared } from "../index.js";

export const ls = () => {
  readdir(shared.dir, { withFileTypes: true }, (e, f) => {
    if (e) console.error("Operation failed -", e.message);
    else {
      console.table(
        f
          .filter((d) => d.isDirectory() || d.isFile())
          .map((d) => ({
            Name: d.name,
            Type: d.isFile() ? "file" : "directory",
          }))
      );
    }
    shared.showCD();
  });
};
