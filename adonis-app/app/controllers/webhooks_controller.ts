import Project from '#models/project'
import { DeploySshService } from '#services/deploy_ssh_service'
import type { HttpContext } from '@adonisjs/core/http'
import crypto from 'crypto'
import { DateTime } from 'luxon'

export default class WebhooksController {
  public async handleWebhook({ request, response }: HttpContext) {
    const event = request.header('X-GitHub-Event')

    // 1️⃣ Gestion spéciale pour l'événement ping (jamais signé par GitHub)
    if (event === 'ping') {
      console.log('Webhook GitHub : ping reçu')
      return response.status(200).send('pong')
    }

    // 2️⃣ Vérification de la présence de la signature
    const signature = request.header('X-Hub-Signature-256')
    if (!signature) {
      console.warn('Webhook GitHub : signature manquante')
      return response.status(400).send('Signature manquante')
    }

    // 3️⃣ Récupération du corps brut envoyé par GitHub
    const bodyRaw = request.raw()
    if (!bodyRaw) {
      console.error('Webhook GitHub : corps brut vide')
      return response.status(400).send('Corps brut manquant')
    }

    // 4️⃣ Traitement de l'événement
    const payload = request.body()
    console.log(`Webhook GitHub : événement "${event}" reçu`)

    const repoUrl = payload.repository?.clone_url
    if (!repoUrl) {
      console.error('Webhook GitHub : URL du dépôt manquante')
      return response.status(400).send('URL du dépôt manquante')
    }

    // 5️⃣ Récupération du projet correspondant
    const project = await Project.findBy({ git_url: repoUrl })
    if (!project) {
      console.error(`Webhook GitHub : projet ${repoUrl} introuvable`)
      return response.status(404).send(`Projet ${repoUrl} introuvable`)
    }

    // 6️⃣ Calcul du HMAC
    const hmac = crypto.createHmac('sha256', project.webhook_secret)
    const digest = `sha256=${hmac.update(bodyRaw).digest('hex')}`

    // 7️⃣ Comparaison sécurisée des signatures
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
      console.warn('Webhook GitHub : signature invalide')
      return response.status(401).send('Signature invalide')
    }

    const editedBranch = payload.ref.split('/').at(-1)
    if (editedBranch !== project.branch) {
      console.warn(`Webhook GitHub : branche éditée "${editedBranch}" n'est pas écoutée`)
      return response.status(403).send(`Branche "${editedBranch}" non écoutée`)
    }

    const commands = [project.before_pull_command, 'git pull', project.after_pull_command, project.restart_command].filter(v => v != null).join(" && ")

    DeploySshService.deployProject({
      deployCommands: commands,
      cwd: project.path
    })

    // Mettre à jour project.last_deploy
    project.lastDeploy = DateTime.now()
    await project.save()

    return response.status(200).send('OK')
  }
}
