import {argv, env, exit, stdin, stdout} from "process"
import readline from "readline"
import {homedir} from "os"
import {dirname} from "path"

const userName = argv[2]?.startsWith('--username=') ? argv[2].split('=')[1] : env.npm_config_username ? env.npm_config_username : 'Guest'
const rl = readline.createInterface({
  input: stdin,
  output: stdout
})

let dir = homedir()

const end = () => {
  console.log(`Thank you for using File Manager, ${userName}, goodbye!`)
  rl.close()
  exit(0)
}

const up = () => {
  dir = dirname(dir)
}

const commands = {
  ".exit": end,
  "up": up,
}

console.log(`Welcome to the File Manager, ${userName}!`)
console.log(`You are currently in ${dir},`, `Enter command` )

rl.on('SIGINT', () => end())
rl.on('line', i => {
  i = i.trim()
  try {
    commands[i] ? commands[i]() : console.log('Invalid input')
  } catch (e) {
    console.log('Operation failed')
  }
  console.log(`You are currently in ${dir},`, `Enter command`)
})

