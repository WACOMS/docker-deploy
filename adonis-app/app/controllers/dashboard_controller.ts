import Project from '#models/project'
import { ProjectValidator } from '#validators/project'
import type { HttpContext } from '@adonisjs/core/http'

type ProjectEntries = {
  name: string
  path: string
  git_url: string
  branch: string
  before_pull_command: string | null
  after_pull_command: string | null
  restart_command: string
}

export default class DashboardController {
  public async projects({ view }: HttpContext) {
    const projects = await Project.all()
    return view.render('pages/projects.edge', {
      activePage: 'projects',
      projects,
    })
  }

  public async newProjectView({ view }: HttpContext) {
    const secret = Array.from({ length: 18 }, () =>
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.charAt(
        Math.floor(Math.random() * 62)
      )
    ).join('')
    return view.render('pages/create-project.edge', {
      secret,
    })
  }

  public async createProject({ request, session, response }: HttpContext) {
    try {
      const rawPayload = request.all()
      formatCommands(rawPayload)
      const payload = (await request.validateUsing(ProjectValidator, rawPayload)) as ProjectEntries
      const project = new Project()
      await project.merge({ ...payload }).save()
      session.flash('success', 'Projet créé avec succès !')
      return response.redirect().toRoute('dashboard.index')
    } catch (err) {
      if (err.status === 422) {
        console.error(err)
        session.flash('error', 'Erreur lors de la création du projet : champs invalides')
        return response.redirect().back()
      }
      console.error(err)
      session.flash('error', 'Une erreur est survenue lors de la création du projet')
      return response.redirect().back()
    }
  }

  public async deleteProject({ request, session, response }: HttpContext) {
    const projectId = request.input('id')
    const project = await Project.find(projectId)
    if (!project) {
      session.flash('error', 'Projet introuvable')
      return response.redirect().toRoute('dashboard.index')
    }
    await project.delete()
    session.flash('success', 'Projet supprimé avec succès')
    return response.redirect().toRoute('dashboard.index')
  }
}

function formatCommands(
  payload: Record<string, any>,
  fields: string[] = ['before_pull_command', 'after_pull_command', 'restart_command']
) {
  for (const field of fields) {
    const value = payload[field];

    if (Array.isArray(value)) {
      const filtered = value.filter((s) => typeof s === 'string' && s.trim() !== '');
      if (filtered.length === 0) {
        delete payload[field];
      } else {
        payload[field] = filtered.join(' && ');
      }
    } else if (value == null || (typeof value === 'string' && value.trim() === '')) {
      delete payload[field];
    }
  }
}
