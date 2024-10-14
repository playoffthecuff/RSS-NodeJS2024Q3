import { EOL, cpus, homedir, userInfo, arch } from "os";
import { shared } from "../index.js";

export const os = (a) => {
  switch (a) {
    case "--EOL":
      console.log(EOL);
      break;
    case "--cpus":
      console.table(cpus(), ["model", "speed"]);
      break;
    case "--homedir":
      console.log(homedir());
      break;
    case "--username":
      console.log(userInfo().username);
      break;
    case "--architecture":
      console.log(arch());
      break;
    default:
      console.warn("Invalid input");
  }
  shared.showCD();
};
