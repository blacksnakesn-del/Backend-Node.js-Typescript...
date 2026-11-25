'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const columns = await queryInterface.describeTable('cours')
    if (columns.duree) {
      await queryInterface.removeColumn('cours', 'duree')
    }
  },

  async down(queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable('cours')
    if (!columns.duree) {
      await queryInterface.addColumn('cours', 'duree', {
        type: Sequelize.TIME,
        allowNull: false,
      })
    }
  },
}
