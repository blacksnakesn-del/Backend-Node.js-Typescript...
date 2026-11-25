'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const columns = await queryInterface.describeTable('cours')
    if (!columns.category) {
      await queryInterface.addColumn('cours', 'category', {
        type: Sequelize.ENUM('web', 'data', 'other'),
        allowNull: false,
        defaultValue: 'web',
      })
    }
  },

  async down(queryInterface) {
    const columns = await queryInterface.describeTable('cours')
    if (columns.category) {
      await queryInterface.removeColumn('cours', 'category')
    }
  },
}