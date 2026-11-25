'use strict';

const { randomUUID } = require('node:crypto')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    const now = new Date()
    const [courses] = await queryInterface.sequelize.query('SELECT id FROM cours ORDER BY created_at')
    if (courses.length === 0) throw new Error('Un cours doit exister avant de créer les modules de démonstration.')
    const coursId = courses[0].id
    await queryInterface.bulkInsert('modules', [
      {
        id: randomUUID(),
        name: "Module 1",
        description: "Description du module 1",
        nombre_lecons: 5,
        cours_id: coursId,
        created_at: now,
        updated_at: now
      },
      {
        id: randomUUID(),
        name: "Module 2",
        description: "",
        nombre_lecons: 10,
        cours_id: coursId,
        created_at: now,
        updated_at: now
      }
    ])
  },

  async down (queryInterface) {
   await queryInterface.bulkDelete('modules', null, {})
  }
};
