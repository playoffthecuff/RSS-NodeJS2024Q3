import {argv, env, exit, stdin, stdout} from "process"
import readline from "readline"
import {homedir} from "os"
import {dirname, join, resolve} from "path"
import { access, constants, createReadStream, readdir, rename, stat, writeFile } from "fs";

const userName = argv[2]?.startsWith('--username=') ? argv[2].split('=')[1] : env.npm_config_username ? env.npm_config_username : 'Guest'
const rl = readline.createInterface({
  input: stdin,
  output: stdout
})

let dir = homedir()

const showCD = () => console.info(`You are currently in ${dir},`, `Enter command:`)

const end = () => {
  console.log(`Thank you for using File Manager, ${userName}, goodbye!`)
  rl.close()
  exit(0)
}

const up = () => {
  dir = dirname(dir)
  showCD()
}

const cd = (p) => {
  stat(resolve(dir, p), (e,s) => {
    if (e) console.error('Operation failed -', e.message)
    else if (!s.isDirectory()) console.warn("Operation failed - destination isn't a directory")
    else dir = resolve(dir, p)
    showCD()
  })
}

const ls = () => {
  readdir(dir, {withFileTypes: true}, (e,f) => {
    if (e) console.error('Operation failed -', e.message)
    else {
      console.table(f.filter(d => d.isDirectory() || d.isFile()).map(d => ({Name: d.name, Type: d.isFile() ? 'file' : 'directory'})))
      showCD()
    }
  })
}

const cat = (p) => {
  p = resolve(dir, p)
  stat(resolve(p), (e,s) => {
    if (e) console.error('Operation failed -', e.message)
    else if (!s.isFile()) console.warn("Operation failed - destination isn't a file")
    else {
      const i = createReadStream(p)
      i.pipe(stdout)
      i.on('end', () => {console.log('\n'); showCD()})
    }
  })
}

const add = (p) => {
  p = resolve(dir, p)
  access(p, constants.F_OK, e => {
    if (!e) console.warn("Operation failed - such file already exist")
    else writeFile(p, '', e => {
      if (e) console.error('Operation failed -', e.message)
    })
    showCD()
  })
}

const rn = (p, n) => {
  n = resolve(dir, n)
  access(n, constants.F_OK, e => {
    if (!e) console.warn("Operation failed - target file already exist")
    else rename(resolve(dir, p), resolve(dir, n), e => {
      if (e) console.error('Operation failed -', e.message)
    })
  })
  showCD()
}

const commands = {
  ".exit": end,
  up,
  cd,
  ls,
  cat,
  add,
  rn,
}

console.log(`Welcome to the File Manager, ${userName}!`)
showCD()

rl.on('SIGINT', () => end())
rl.on('line', i => {
  i = i.trim()
  try {
    const cmd = i.replace(/ [\s\S]+/, '')
    commands[cmd] ? commands[cmd](...i.split(' ').slice(1)) : console.warn('Invalid input')
  } catch (e) {
    console.warn('Operation failed')
    console.log(e)
  }
})

