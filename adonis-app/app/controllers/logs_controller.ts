import Project from "#models/project";
import { HttpContext } from "@adonisjs/core/http";

export default class LogsController {

    public async showLogs({ view }: HttpContext) {
        const projects = await Project.query()
        const lastProject = projects.findLast(() => true)
        return view.render('pages/logs', {
            project: lastProject
        })
    }
}