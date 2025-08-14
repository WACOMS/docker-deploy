import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'projects'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('name').notNullable().unique(),
      table.string('path').notNullable().unique(),
      table.string('git_url').notNullable().unique(),
      table.string('branch').notNullable(),
      table.string('before_pull_command').nullable(),
      table.string('after_pull_command').nullable(),
      table.string('build_command').notNullable(),
      table.string('restart_command').notNullable(),

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}