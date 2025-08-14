import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  async showLoginForm({ view }: HttpContext) {
    return view.render('pages/auth/login')
  }

  async login({ request, session, auth, response }: HttpContext) {
    const email = request.input('id')
    const password = request.input('password')

    try {
      const user = await User.verifyCredentials(email, password)
      await auth.use('web').login(user)
      return response.redirect().toRoute('dashboard.index')
    } catch {
      session.flash('erreur', 'Identifiants invalides')
      return response.redirect().back()
    }
  }

  async logout({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect().toRoute('auth.login')
  }
}
