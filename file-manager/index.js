import {argv, env, exit, stdin, stdout} from "process"
import readline from "readline"
import {homedir} from "os"

const userName = argv[2]?.startsWith('--username=') ? argv[2].split('=')[1] : env.npm_config_username ? env.npm_config_username : 'Guest'
const rl = readline.createInterface({
  input: stdin,
  output: stdout
})

console.log(`Welcome to the File Manager, ${userName}!`)
const dir = homedir()
console.log(`You are currently in ${dir}`)
console.log(`Enter command`)

rl.on('SIGINT', () => end())
rl.on('line', i => {
  i.trim() === '.exit' && end()
  console.log(`You are currently in ${dir}`, `Enter command`)
})

const end = () => {
  console.log(`Thank you for using File Manager, ${userName}, goodbye!`)
  rl.close()
  exit(0)
}