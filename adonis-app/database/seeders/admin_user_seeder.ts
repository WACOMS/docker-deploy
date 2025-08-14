import User from '#models/user'
import env from '#start/env'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const user = new User()
    user.fullName = "Administrateur"
    user.email = env.get('ADMIN_LOGIN', 'admin@example.com')
    user.password = env.get('ADMIN_PASSWORD', 'securepassword')
    await user.save()
  }
}