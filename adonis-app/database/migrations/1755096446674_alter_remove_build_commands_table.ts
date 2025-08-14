import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'projects'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('build_command')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('build_command').notNullable()
    })
  }
}