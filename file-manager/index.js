import {argv, env, exit, stdin, stdout} from "process"
import readline from "readline"
import {homedir} from "os"
import {dirname, resolve} from "path"
import { access, stat } from "fs";

const userName = argv[2]?.startsWith('--username=') ? argv[2].split('=')[1] : env.npm_config_username ? env.npm_config_username : 'Guest'
const rl = readline.createInterface({
  input: stdin,
  output: stdout
})

let dir = homedir()

const showCD = () => console.info(`You are currently in ${dir},`, `Enter command`)

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
    else if (!s.isDirectory()) console.warn("Operation failed - destination isn't directory")
    else dir = resolve(dir, p)
    showCD()
  })
}

const commands = {
  ".exit": end,
  "up": up,
  "cd": cd,
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
    // console.log(e)
  }
})

