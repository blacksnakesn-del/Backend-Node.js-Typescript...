'use strict'

const { randomUUID } = require('node:crypto');
 
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface) {
    const now = new Date()
    const [teachers] = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE email = 'teacher@cours-alygne.test' AND role = 'teacher' LIMIT 1"
    )
    if (teachers.length === 0) {
      throw new Error('Le compte professeur de démonstration doit être créé avant le seeder des cours.')
    }

    const courses = [
      {
        name: "Dev Web Mobile",
        description: "Salle de formation des metiers de information",
        proffesseur: teachers[0].id,
        capacite: 50,
        lieu: "Salle Nelson Mandella",
        category: "web",
        published: false
      },
      {
        name: "Dev Data",
        description: "Salle de formation des metiers de information",
        proffesseur: teachers[0].id,
        capacite: 25,
        lieu: "Salle Doubi",
        category: "data",
        published: false
      },
      {
        name: "Hacking Tuto",
        description: "Zero day hacking",
        proffesseur: teachers[0].id,
        capacite: 100,
        lieu: "Salle Doubi",
        category: "other",
        published: false
      },
      {
        name: "Plitique et Economie",
        description: "",
        proffesseur: teachers[0].id,
        capacite: 250,
        lieu: "Salle Politique",
        category: "other",
        published: false
      }
    ]

    for (const course of courses) {
      const [existingCourses] = await queryInterface.sequelize.query(
        'SELECT id FROM cours WHERE name = :name LIMIT 1',
        { replacements: { name: course.name } }
      )

      if (existingCourses.length > 0) {
        await queryInterface.bulkUpdate(
          'cours',
          { ...course, updated_at: now },
          { id: existingCourses[0].id }
        )
      } else {
        await queryInterface.bulkInsert('cours', [
          {
            id: randomUUID(),
            ...course,
            created_at: now,
            updated_at: now
          }
        ])
      }
    }
  },
  
  async down (queryInterface) {
    await queryInterface.bulkDelete('cours', {
      name: ["Dev Web Mobile", "Dev Data", "Hacking Tuto", "Plitique et Economie"]
    })
  }
}
