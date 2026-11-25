'use strict'

const { randomUUID } = require('node:crypto')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
   const [modules] = await queryInterface.sequelize.query('SELECT id FROM modules ORDER BY created_at')
   if (modules.length === 0) throw new Error('Un module doit exister avant de créer les leçons de démonstration.')
   const moduleId = modules[0].id
   await queryInterface.bulkInsert('lecons', [
      {
        id: randomUUID(),
        name: "Leçon 1",
        description: "Description de la leçon 1",
        duree: "00:45:00",
        module_id: moduleId, 
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: randomUUID(),
        name: "Leçon 2",
        description: "Description de la leçon 2",
        duree: "00:45:00",
        module_id: moduleId, 
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: randomUUID(),
        name: "Leçon 3",
        description: "Description de la leçon 3",
        duree: "00:45:00",
        module_id: moduleId, 
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: randomUUID(),
        name: "Leçon 4",
        description: "Description de la leçon 4",
        duree: "00:45:00",
        module_id: moduleId, 
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: randomUUID(),
        name: "Leçon 5",
        description: "Description de la leçon 5",
        duree: "00:45:00",
        module_id: moduleId, 
        created_at: new Date(),
        updated_at: new Date()
      }
    ])
  },

  async down (queryInterface) {
    await queryInterface.bulkDelete('lecons', null, {});
  }
};