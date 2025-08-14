import { readFileSync } from 'fs'
import { NodeSSH } from 'node-ssh'

const ssh = new NodeSSH()
const key = readFileSync('/home/node/.ssh/id_rsa', 'utf8')

export class DeploySshService {
  
  public static async deployProject(deployCommands: string, cwd: string) {
    await ssh.connect({
      host: 'host.docker.internal',
      username: 'deploy',
      privateKey: key,
    })

    const result = await ssh.execCommand(deployCommands, {
      cwd: cwd,
    })

    console.log('STDOUT :', result.stdout)
    console.log('STDERR :', result.stderr)

    ssh.dispose()
  }
}
