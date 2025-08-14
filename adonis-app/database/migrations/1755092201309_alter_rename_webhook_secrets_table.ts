import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'projects'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('secret_key', 'webhook_secret')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
    })
  }
}