'use strict'

const DEMO_ENROLLMENTS = [
  {
    id: '650e8400-e29b-41d4-a716-446655440000',
    email: 'learner@cours-alygne.test',
    course: 'Dev Web Mobile',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    email: 'learner@cours-alygne.test',
    course: 'Dev Data',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    email: 'learner@cours-alygne.test',
    course: 'Hacking Tuto',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    email: 'learner@cours-alygne.test',
    course: 'Plitique et Economie',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    email: 'awa.diop@cours-alygne.test',
    course: 'Dev Web Mobile',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    email: 'awa.diop@cours-alygne.test',
    course: 'Dev Data',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    email: 'awa.diop@cours-alygne.test',
    course: 'Hacking Tuto',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    email: 'moussa.ndiaye@cours-alygne.test',
    course: 'Dev Web Mobile',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440008',
    email: 'moussa.ndiaye@cours-alygne.test',
    course: 'Dev Data',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440009',
    email: 'fatou.fall@cours-alygne.test',
    course: 'Dev Web Mobile',
  },
  {
    id: '550e8400-e29b-41d4-a716-44665544000a',
    email: 'fatou.fall@cours-alygne.test',
    course: 'Dev Data',
  },
  {
    id: '550e8400-e29b-41d4-a716-44665544000b',
    email: 'fatou.fall@cours-alygne.test',
    course: 'Hacking Tuto',
  }
]

module.exports = {
  async up(queryInterface) {
    const now = new Date()
    const [learners] = await queryInterface.sequelize.query(
      "SELECT id, email FROM users WHERE role = 'learner' AND is_active = 1"
    )
    const [courses] = await queryInterface.sequelize.query(
      'SELECT id, name FROM cours'
    )
    const learnersByEmail = new Map(learners.map((learner) => [learner.email, learner.id]))
    const coursesByName = new Map(courses.map((course) => [course.name, course.id]))
    const inscriptions = []

    for (const enrollment of DEMO_ENROLLMENTS) {
      const userId = learnersByEmail.get(enrollment.email)
      const coursId = coursesByName.get(enrollment.course)
      if (!userId || !coursId) {
        throw new Error(
          `L’apprenant ${enrollment.email} et le cours ${enrollment.course} doivent exister avant le seeder des inscriptions.`
        )
      }

      const [existing] = await queryInterface.sequelize.query(
        'SELECT id FROM inscriptions WHERE cours_id = :coursId AND user_id = :userId',
        { replacements: { coursId, userId } }
      )
      if (existing.length > 0) continue

      inscriptions.push({
        id: enrollment.id,
        cours_id: coursId,
        user_id: userId,
        date_inscription: now,
        created_at: now,
        updated_at: now,
      })
    }

    if (inscriptions.length > 0) {
      await queryInterface.bulkInsert('inscriptions', inscriptions)
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(
      'inscriptions',
      { id: DEMO_ENROLLMENTS.map((enrollment) => enrollment.id) },
      {}
    )
  },
}
