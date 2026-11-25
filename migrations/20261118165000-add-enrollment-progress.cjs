'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    let columns = await queryInterface.describeTable('inscriptions')
    if (columns.coursId && !columns.cours_id) {
      await queryInterface.sequelize.query(
        'ALTER TABLE `inscriptions` RENAME COLUMN `coursId` TO `cours_id`'
      )
    }

    columns = await queryInterface.describeTable('inscriptions')
    if (columns.userId && !columns.user_id) {
      await queryInterface.sequelize.query(
        'ALTER TABLE `inscriptions` RENAME COLUMN `userId` TO `user_id`'
      )
    }

    columns = await queryInterface.describeTable('inscriptions')
    if (columns.createdAt && !columns.created_at) {
      await queryInterface.sequelize.query(
        'ALTER TABLE `inscriptions` RENAME COLUMN `createdAt` TO `created_at`'
      )
    }
    columns = await queryInterface.describeTable('inscriptions')
    if (columns.updatedAt && !columns.updated_at) {
      await queryInterface.sequelize.query(
        'ALTER TABLE `inscriptions` RENAME COLUMN `updatedAt` TO `updated_at`'
      )
    }

    columns = await queryInterface.describeTable('inscriptions')
    if (!columns.date_inscription) {
      await queryInterface.addColumn('inscriptions', 'date_inscription', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      })
    }

    await queryInterface.addConstraint('inscriptions', {
      fields: ['cours_id', 'user_id'],
      type: 'unique',
      name: 'inscriptions_course_user_uq'
    })

    await queryInterface.createTable('inscription_progressions', {
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      inscription_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'inscriptions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      lesson_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'lecons', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      progress: { type: Sequelize.TINYINT.UNSIGNED, allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    })

    await queryInterface.addConstraint('inscription_progressions', {
      fields: ['inscription_id', 'lesson_id'],
      type: 'unique',
      name: 'inscription_progression_uq'
    })
  },

  async down (queryInterface) {
    await queryInterface.dropTable('inscription_progressions')
    await queryInterface.removeConstraint('inscriptions', 'inscriptions_course_user_uq')
    await queryInterface.removeColumn('inscriptions', 'date_inscription')

    const columns = await queryInterface.describeTable('inscriptions')
    if (columns.updated_at && !columns.updatedAt) {
      await queryInterface.sequelize.query(
        'ALTER TABLE `inscriptions` RENAME COLUMN `updated_at` TO `updatedAt`'
      )
    }
    if (columns.created_at && !columns.createdAt) {
      await queryInterface.sequelize.query(
        'ALTER TABLE `inscriptions` RENAME COLUMN `created_at` TO `createdAt`'
      )
    }
    if (columns.user_id && !columns.userId) {
      await queryInterface.sequelize.query(
        'ALTER TABLE `inscriptions` RENAME COLUMN `user_id` TO `userId`'
      )
    }
    if (columns.cours_id && !columns.coursId) {
      await queryInterface.sequelize.query(
        'ALTER TABLE `inscriptions` RENAME COLUMN `cours_id` TO `coursId`'
      )
    }
  }
}
