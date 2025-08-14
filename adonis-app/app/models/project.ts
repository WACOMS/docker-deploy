import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Project extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare path: string

  @column()
  declare git_url: string

  @column()
  declare branch: string

  @column()
  declare before_pull_command?: string | null

  @column()
  declare after_pull_command?: string | null

  @column()
  declare restart_command: string

  @column.dateTime({ columnName: 'last_deployment' })
  declare lastDeploy: DateTime

  @column()
  declare webhook_secret: string

  @column()
  declare status?: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}