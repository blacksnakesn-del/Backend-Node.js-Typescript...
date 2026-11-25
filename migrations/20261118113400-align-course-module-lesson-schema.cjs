'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    let columns = await queryInterface.describeTable('cours')
    if (columns.professeur && !columns.proffesseur) {
      await queryInterface.renameColumn('cours', 'professeur', 'proffesseur')
    }
    columns = await queryInterface.describeTable('cours')
    if (columns.capacity && !columns.capacite) {
      await queryInterface.renameColumn('cours', 'capacity', 'capacite')
    }
    columns = await queryInterface.describeTable('cours')
    if (!columns.published) {
      await queryInterface.addColumn('cours', 'published', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      })
    }

    let moduleColumns = await queryInterface.describeTable('modules')
    if (moduleColumns.nombreLecons && !moduleColumns.nombre_lecons) {
      await queryInterface.renameColumn('modules', 'nombreLecons', 'nombre_lecons')
    }
    moduleColumns = await queryInterface.describeTable('modules')
    if (!moduleColumns.cours_id) {
      await queryInterface.addColumn('modules', 'cours_id', {
        type: Sequelize.UUID,
        allowNull: true
      })
      await queryInterface.addConstraint('modules', {
        fields: ['cours_id'],
        type: 'foreign key',
        name: 'modules_cours_id_fk',
        references: { table: 'cours', field: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      })
    }

    const lessonColumns = await queryInterface.describeTable('lecons')
    if (lessonColumns.moduleId && !lessonColumns.module_id) {
      await queryInterface.sequelize.query(
        'ALTER TABLE `lecons` RENAME COLUMN `moduleId` TO `module_id`'
      )
    }
    if (!lessonColumns.duree) {
      await queryInterface.addColumn('lecons', 'duree', {
        type: Sequelize.TIME,
        allowNull: true
      })
    }
  },

  async down (queryInterface) {
    const courseColumns = await queryInterface.describeTable('cours')
    const legacySchema =
      Boolean(courseColumns.duree) ||
      Boolean(courseColumns.professeur) ||
      Boolean(courseColumns.capacity)

    if (!legacySchema) return

    const moduleColumns = await queryInterface.describeTable('modules')
    if (moduleColumns.cours_id) {
      await queryInterface.removeConstraint('modules', 'modules_cours_id_fk')
      await queryInterface.removeColumn('modules', 'cours_id')
    }
    if (moduleColumns.nombre_lecons && !moduleColumns.nombreLecons) {
      await queryInterface.renameColumn('modules', 'nombre_lecons', 'nombreLecons')
    }

    const lessonColumns = await queryInterface.describeTable('lecons')
    if (lessonColumns.duree) {
      await queryInterface.removeColumn('lecons', 'duree')
    }
    if (lessonColumns.module_id && !lessonColumns.moduleId) {
      await queryInterface.sequelize.query(
        'ALTER TABLE `lecons` RENAME COLUMN `module_id` TO `moduleId`'
      )
    }

    if (courseColumns.published) {
      await queryInterface.removeColumn('cours', 'published')
    }
    if (courseColumns.proffesseur && !courseColumns.professeur) {
      await queryInterface.renameColumn('cours', 'proffesseur', 'professeur')
    }
    if (courseColumns.capacite && !courseColumns.capacity) {
      await queryInterface.renameColumn('cours', 'capacite', 'capacity')
    }
  }
}
