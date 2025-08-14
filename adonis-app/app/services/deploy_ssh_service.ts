import env from '#start/env'
import { readFileSync } from 'fs'
import { NodeSSH } from 'node-ssh'

const ssh = new NodeSSH()
const key = readFileSync('/home/node/.ssh/id_rsa', 'utf8')

export class DeploySshService {
  public static async deployProject({
    deployCommands,
    cwd,
  }: {
    deployCommands: string
    cwd: string
  }) {
    try {
      await ssh.connect({
        host: 'host.docker.internal',
        username: env.get('SSH_USER'),
        privateKey: key,
      })

      const result = await ssh.execCommand(deployCommands, {
        cwd,
        onStdout(chunk) {
          console.log('STDOUT :', chunk.toString())
        },
        onStderr(chunk) {
          console.error('STDERR :', chunk.toString())
        },
      })
      if (typeof result.code === 'number' && result.code !== 0) {
        throw new Error(`Commande distante terminée avec le code ${result.code}`)
      }
      console.log("Commande distante terminée avec succès");
    } catch (err) {
      console.error("Une erreur s'est produite lors de l'exécution des commandes SSH :", err)
    } finally {
      ssh.dispose()
    }
  }
}
