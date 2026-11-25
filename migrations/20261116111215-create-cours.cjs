'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('cours', {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      name: { type: Sequelize.STRING(200), allowNull: false },
      description: { type: Sequelize.STRING(), allowNull: false },
      proffesseur: { type: Sequelize.STRING(150), allowNull: false },
      capacite: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      lieu: { type: Sequelize.STRING(200), allowNull: false },
      published: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    })
  },

  async down (queryInterface) {
    await queryInterface.dropTable('cours')
  }
}
