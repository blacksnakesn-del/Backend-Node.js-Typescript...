'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('modules', {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      name: { type: Sequelize.STRING(200), allowNull: false },
      description: { type: Sequelize.STRING(), allowNull: true },
      nombre_lecons: { type: Sequelize.INTEGER(), allowNull: false },
      cours_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'cours', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    })
  },

  async down (queryInterface) {
    await queryInterface.dropTable('modules')
  }
};
