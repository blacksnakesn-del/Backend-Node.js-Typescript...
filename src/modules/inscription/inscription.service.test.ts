import { describe, expect, it, vi } from 'vitest'
import type { IInscriptionRepository } from './inscription.repository.js'
import { InscriptionService } from './inscription.service.js'

function createInscriptionRepository(): IInscriptionRepository {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findByCoursId: vi.fn(),
    findByUserId: vi.fn(),
    findByCoursAndUser: vi.fn(),
    countByCoursId: vi.fn(),
    listTopLearners: vi.fn().mockResolvedValue([
      { name: 'Étudiant', email: 'student@example.com', enrollment_count: 3 },
    ]),
    listStudentsByProfessorId: vi.fn().mockResolvedValue({
      rows: [
        {
          id: 'student-id',
          name: 'Étudiant',
          email: 'student@example.com',
          courses_followed: 2,
        },
      ],
      count: 15,
    }),
  }
}

describe('InscriptionService.getTopLearners', () => {
  it('retourne le nombre demandé d’apprenants classés par inscriptions', async () => {
    const repository = createInscriptionRepository()
    const service = new InscriptionService(repository)

    await expect(service.getTopLearners(1)).resolves.toEqual([
      { name: 'Étudiant', email: 'student@example.com', enrollment_count: 3 },
    ])
    expect(repository.listTopLearners).toHaveBeenCalledWith(1)
  })
})

describe('InscriptionService.getProfessorStudents', () => {
  it('retourne les étudiants et les métadonnées de pagination du professeur connecté', async () => {
    const repository = createInscriptionRepository()
    const service = new InscriptionService(repository)

    await expect(
      service.getProfessorStudents(
        'teacher-id',
        'teacher-id',
        { page: 2, perPage: 10 },
      ),
    ).resolves.toEqual({
      students: [
        {
          id: 'student-id',
          name: 'Étudiant',
          email: 'student@example.com',
          courses_followed: 2,
        },
      ],
      pagination: { page: 2, per_page: 10, total: 15, total_pages: 2 },
    })
    expect(repository.listStudentsByProfessorId).toHaveBeenCalledWith(
      'teacher-id',
      { page: 2, perPage: 10 },
    )
  })

  it('refuse la liste demandée pour un autre professeur', async () => {
    const repository = createInscriptionRepository()
    const service = new InscriptionService(repository)

    await expect(
      service.getProfessorStudents(
        'another-teacher-id',
        'teacher-id',
        { page: 1, perPage: 20 },
      ),
    ).rejects.toMatchObject({ status: 403 })
    expect(repository.listStudentsByProfessorId).not.toHaveBeenCalled()
  })
})
