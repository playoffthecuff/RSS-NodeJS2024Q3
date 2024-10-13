import {argv, env, exit, stdin, stdout} from "process"
import readline from "readline"

const userName = argv[2]?.startsWith('--username=') ? argv[2].split('=')[1] : env.npm_config_username ? env.npm_config_username : 'Guest'
const rl = readline.createInterface({
  input: stdin,
  output: stdout
})

console.log(`Welcome to the File Manager, ${userName}!`)
const dir = import.meta.dirname
console.log(`You are currently in ${dir}`)

rl.on('SIGINT', () => end())
rl.on('line', i => {
  console.log(`You are currently in ${dir}`)
  i.trim() === '.exit' && end()
})

const end = () => {
  console.log(`Thank you for using File Manager, ${userName}, goodbye!`)
  rl.close()
  exit(0)
}