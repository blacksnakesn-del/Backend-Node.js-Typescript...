'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('cours', 'proffesseur', {
      type: Sequelize.UUID,
      allowNull: false,
    })
    await queryInterface.addConstraint('cours', {
      fields: ['proffesseur'],
      type: 'foreign key',
      name: 'cours_proffesseur_users_fk',
      references: { table: 'users', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('cours', 'cours_proffesseur_users_fk')
    await queryInterface.changeColumn('cours', 'proffesseur', {
      type: Sequelize.STRING(150),
      allowNull: false,
    })
  },
}
