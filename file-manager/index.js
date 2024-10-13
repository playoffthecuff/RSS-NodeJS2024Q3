import {argv, env, exit, stdin, stdout} from "process"
import readline from "readline"

const userName = argv[2]?.startsWith('--username=') ? argv[2].split('=')[1] : env.npm_config_username ? env.npm_config_username : 'Guest'
const rl = readline.createInterface({
  input: stdin,
  output: stdout
})

rl.on('SIGINT', () => end())
rl.on('line', (i) => i.trim() === '.exit' && end())

const end = () => {
  console.log(`Thank you for using File Manager, ${userName}, goodbye!`)
  rl.close()
  exit(0)
}
console.log(`Welcome to the File Manager, ${userName}!`)