'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable('cours')
    if (!columns.summary) {
      await queryInterface.addColumn('cours', 'summary', {
        type: Sequelize.TEXT,
        allowNull: true,
      })
    }
    if (!columns.level) {
      await queryInterface.addColumn('cours', 'level', {
        type: Sequelize.ENUM('starter', 'intermedaire', 'advenced'),
        allowNull: true,
      })
    }
  },

  async down(queryInterface) {
    const columns = await queryInterface.describeTable('cours')
    if (columns.level) await queryInterface.removeColumn('cours', 'level')
    if (columns.summary) await queryInterface.removeColumn('cours', 'summary')
  },
}
