import type Project from '#models/project'
import env from '#start/env'
import drive from '@adonisjs/drive/services/main'
import { readFileSync } from 'fs'
import { NodeSSH } from 'node-ssh'
import type Stream from 'stream'
import { PassThrough } from 'stream'


const ssh = new NodeSSH()
const key = readFileSync('/home/node/.ssh/id_rsa', 'utf8')

export class DeploySshService {
  public static async deployProject({
    deployCommands,
    cwd,
    project
  }: {
    deployCommands: string
    cwd: string
    project: Project
  }) {
    try {
      await ssh.connect({
        host: 'host.docker.internal',
        username: env.get('SSH_USER'),
        privateKey: key,
      })

      // On utiise webhook_secret comme identifiant du projet car on est certain qu'il est unique
      const projectId = project.webhook_secret
      const stdoutStream = new PassThrough()
      const stdoutPromise = saveStream(`${projectId}.log`, stdoutStream)

      const result = await ssh.execCommand(deployCommands, {
        cwd,
        async onStdout(chunk) {
          stdoutStream.write(chunk)
        },
        async onStderr(chunk) {
          stdoutStream.write(chunk)
        },
      })

      stdoutStream.end()

      await Promise.all([stdoutPromise])

      if (typeof result.code === 'number' && result.code !== 0) {
        throw new Error(`Commande distante terminée avec le code ${result.code}`)
      }
      project.status = "success"
      await project.save()
    } catch (err) {
      project.status = "failed"
      await project.save()
      console.error("Une erreur s'est produite lors de l'exécution des commandes SSH :", err)
    } finally {
      ssh.dispose()
    }
  }
}


async function saveStream(filePath: string, readableStream: Stream.Readable) {
  await drive.use('fs').putStream(filePath, readableStream)
}