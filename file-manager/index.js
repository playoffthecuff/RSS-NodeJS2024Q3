import { argv, env, exit, stdin, stdout } from "process";
import readline from "readline";
import { arch, EOL, cpus, homedir, userInfo } from "os";
import { dirname, resolve } from "path";
import {
  access,
  constants,
  createReadStream,
  createWriteStream,
  readdir,
  rename,
  rm as remove,
  stat,
  writeFile,
} from "fs";
import { pipeline } from "stream";
import {createHash} from "crypto";
import {createBrotliCompress, createBrotliDecompress} from "zlib"

const userName = argv[2]?.startsWith("--username=")
  ? argv[2].split("=")[1]
  : env.npm_config_username
  ? env.npm_config_username
  : "Guest";
const rl = readline.createInterface({
  input: stdin,
  output: stdout,
});

let dir = homedir();

const showCD = () =>
  console.info(`You are currently in ${dir},`, `Enter command:`);

const end = () => {
  console.log(`Thank you for using File Manager, ${userName}, goodbye!`);
  rl.close();
  exit(0);
};

const up = () => {
  dir = dirname(dir);
  showCD();
};

const cd = (p) => {
  stat(resolve(dir, p), (e, s) => {
    if (e) console.error("Operation failed -", e.message);
    else if (!s.isDirectory())
      console.warn("Operation failed - destination isn't a directory");
    else dir = resolve(dir, p);
    showCD();
  });
};

const ls = () => {
  readdir(dir, { withFileTypes: true }, (e, f) => {
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
      showCD();
    }
  });
};

const cat = (p) => {
  p = resolve(dir, p);
  stat(resolve(p), (e, s) => {
    if (e) console.error("Operation failed -", e.message);
    else if (!s.isFile())
      console.warn("Operation failed - destination isn't a file");
    else {
      const i = createReadStream(p);
      i.pipe(stdout);
      i.on("error", (e) => {
        console.error("Operation failed -", e.message);
        showCD();
      });
      i.on("end", () => {
        console.log("\n");
        showCD();
      });
    }
  });
};

const add = (p) => {
  p = resolve(dir, p);
  access(p, constants.F_OK, (e) => {
    if (!e) console.warn("Operation failed - such file already exist");
    else
      writeFile(p, "", (e) => {
        if (e) console.error("Operation failed -", e.message);
      });
    showCD();
  });
};

const rn = (p, n) => {
  n = resolve(dir, n);
  access(n, constants.F_OK, (e) => {
    if (!e) console.warn("Operation failed - target file already exist");
    else
      rename(resolve(dir, p), resolve(dir, n), (e) => {
        if (e) console.error("Operation failed -", e.message);
      });
  });
  showCD();
};

const cp = (p1, p2) => {
  p1 = resolve(dir, p1);
  p2 = resolve(dir, p2);
  access(p2, constants.F_OK, (e) => {
    if (!e) console.warn("Operation failed - target file already exist");
    else {
      const r = createReadStream(p1);
      const w = createWriteStream(p2);
      pipeline(r, w, (e) => {
        if (e) console.error("Operation failed -", e.message);
        showCD();
      });
    }
  });
};

const mv = (p1, p2) => {
  p1 = resolve(dir, p1);
  p2 = resolve(dir, p2);
  access(p2, constants.F_OK, (e) => {
    if (!e) console.warn("Operation failed - target file already exist");
    else {
      pipeline(createReadStream(p1), createWriteStream(p2), (e) => {
        if (e) console.error("Operation failed -", e.message);
        else
          remove(p1, (e) => {
            if (e) console.error("Operation failed -", e.message);
            showCD();
          });
      });
    }
  });
};

const rm = (p) => {
  remove(resolve(dir, p), (e) => {
    if (e) console.error("Operation failed -", e.message);
    showCD();
  });
};

const os = (a) => {
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
      showCD()
  }
};

const hash = (p) => {
  pipeline(createReadStream(resolve(dir, p)), createHash('sha256').setEncoding('hex'), stdout, e => {
    if (e) console.error("Operation failed -", e.message);
    showCD()
  })
}

const compress = (p1, p2) => {
  p1 = resolve(dir, p1);
  p2 = resolve(dir, p2);
  access(p2, constants.F_OK, (e) => {
    if (!e) console.warn("Operation failed - target file already exist");
    else {
      const r = createReadStream(p1);
      const t = createBrotliCompress()
      const w = createWriteStream(p2);
      pipeline(r, t, w, (e) => {
        if (e) console.error("Operation failed -", e.message);
        showCD();
      });
    }
  });
}

const commands = {
  ".exit": end,
  up,
  cd,
  ls,
  cat,
  add,
  rn,
  cp,
  mv,
  rm,
  os,
  hash,
  compress,
};

console.log(`Welcome to the File Manager, ${userName}!`);
showCD();

rl.on("SIGINT", () => end());
rl.on("line", (i) => {
  i = i.trim();
  try {
    const cmd = i.replace(/ [\s\S]+/, "");
    commands[cmd]
      ? commands[cmd](...i.split(" ").slice(1))
      : console.warn("Invalid input");
  } catch (e) {
    console.warn("Operation failed");
    console.log(e);
  }
});
