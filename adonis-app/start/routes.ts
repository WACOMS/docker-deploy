/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import AuthController from '#controllers/auth_controller'
import DashboardController from '#controllers/dashboard_controller'
import WebhooksController from '#controllers/webhooks_controller'
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'


router.get('/connexion', [AuthController, 'showLoginForm']).as('auth.login')
router.post('/connexion', [AuthController, 'login']).as('auth.login.form')
router.get('/deconnexion', [AuthController, 'logout']).as('auth.logout')

router
  .group(() => {
    router.get('/', [DashboardController, 'projects']).as('dashboard.index')
    router
      .get('/projets/nouveau', [DashboardController, 'newProjectView'])
      .as('dashboard.projects.new.view')
    router
      .post('/projets', [DashboardController, 'createProject'])
      .as('dashboard.projects.new.form')
    router.post('/projets/supprimer', [DashboardController, 'deleteProject']).as('project.delete')
  })
  .middleware(middleware.auth())

router.post('/github-webhooks', [WebhooksController, 'handleWebhook']).as('github.webhooks')
