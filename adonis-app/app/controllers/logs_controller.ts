import Project from "#models/project";
import { HttpContext } from "@adonisjs/core/http";
import app from "@adonisjs/core/services/app";
import { readFileSync } from "fs";

export default class LogsController {

    public async showLogs({ params, session, view, response }: HttpContext) {
        try {
            const project = await Project.findOrFail(params.id)
            const logs = await this.getLogs({ project })
            return view.render('pages/logs', {
                project,
                logs,
            })
        } catch (error) {
            if (error.code === 'E_ROW_NOT_FOUND') {
                session.flash('error', 'Projet introuvable')
                return response.redirect().back()
            }
            session.flash('error', 'Projet non trouvé')
            return response.redirect().back()
        }
    }

    public async getHistory({ params, response }: HttpContext) {
        try {
            const projectId = params.id
            if (!projectId) return response.status(500).send("Projet introuvable")
            const logs = await this.getLogs({ projectId })
            return logs
        } catch (err) {
            if (err.code === 'E_ROW_NOT_FOUND') {
                return response.status(404).send("Le projet n'existe pas")
            }
            console.error("Erreur lors de la récupération des logs :", err);
            response.status(500).send('Erreur lors de la récupération des logs')
        }
    }

    private async getLogs({project, projectId}: {project?: Project, projectId?: string}) {
        try {
            if (projectId && !project) {
                project = await Project.findOrFail(projectId)
            }
            const logFile = app.makePath('tmp/logs', `${(project as Project).webhook_secret}.log`)
            const logContent = await readFileSync(logFile, {
                encoding: 'utf-8',
            })
            return logContent.trim()
        } catch (err) {
            throw err;
        }
    }
}