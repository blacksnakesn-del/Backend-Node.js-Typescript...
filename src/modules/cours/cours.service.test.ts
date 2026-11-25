import { beforeAll, describe, expect, it, vi } from 'vitest'
import { initializeModels } from '../../database/models.js'
import { Cours } from './cours.models.js'
import type { ICoursRepository } from './cours.repository.js'
import { CoursService } from './cours.service.js'
import type { IUserRepository } from '../users/user.repository.js'

beforeAll(() => initializeModels())

const TEACHER_ID = '11111111-1111-4111-8111-111111111111'
const ADMIN_ID = '22222222-2222-4222-8222-222222222222'

function createCours(published = false, proffesseur = TEACHER_ID): Cours {
  return Cours.build({
    name: 'Cours de test',
    description: 'Description du cours',
    proffesseur,
    capacite: 10,
    lieu: 'Salle A',
    category: 'web',
    published,
  })
}

function createRepository(cours: Cours | null): ICoursRepository {
  return {
    findById: vi.fn().mockResolvedValue(cours),
    findByNom: vi.fn().mockResolvedValue(null),
    findAll: vi.fn().mockResolvedValue([]),
    list: vi.fn().mockResolvedValue({ rows: [], count: 0 }),
    findByCategory: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue(createCours()),
    update: vi.fn().mockResolvedValue(cours),
    updatePublished: vi.fn().mockResolvedValue(cours),
    delete: vi.fn().mockResolvedValue(undefined),
  }
}

describe('CoursService', () => {
  it('refuse la suppression d’un cours publié', async () => {
    const repository = createRepository(createCours(true))
    const service = new CoursService(repository)

    await expect(service.deleteCours('cours-id')).rejects.toMatchObject({ status: 409 })
    expect(repository.delete).not.toHaveBeenCalled()
  })

  it('supprime un cours brouillon', async () => {
    const repository = createRepository(createCours())
    const service = new CoursService(repository)

    await expect(service.deleteCours('cours-id')).resolves.toBeUndefined()
    expect(repository.delete).toHaveBeenCalledWith('cours-id')
  })

  it('signale un cours inexistant à la publication', async () => {
    const repository = createRepository(null)
    const service = new CoursService(repository)

    await expect(service.publierCours('cours-inconnu')).rejects.toMatchObject({ status: 404 })
    expect(repository.updatePublished).not.toHaveBeenCalled()
  })

  it('permet au professeur de modifier son cours et le remet hors ligne', async () => {
    const cours = createCours(true, TEACHER_ID)
    const repository = createRepository(cours)
    const service = new CoursService(repository)

    await service.updateCoursPartiellement(
      'cours-id',
      { title: 'Nouveau titre', summary: 'Résumé' },
      { userId: TEACHER_ID, name: 'Professeur', role: 'teacher' },
    )

    expect(repository.update).toHaveBeenCalledWith('cours-id', {
      summary: 'Résumé',
      name: 'Nouveau titre',
      published: false,
    })
  })

  it('refuse à un professeur de modifier le cours d’un autre professeur', async () => {
    const repository = createRepository(createCours(false, TEACHER_ID))
    const service = new CoursService(repository)

    await expect(
      service.updateCoursPartiellement(
        'cours-id',
        { description: 'Nouvelle description' },
        { userId: '33333333-3333-4333-8333-333333333333', name: 'Autre professeur', role: 'teacher' },
      ),
    ).rejects.toMatchObject({ status: 403 })
    expect(repository.update).not.toHaveBeenCalled()
  })

  it('permet à un administrateur de modifier le cours d’un autre professeur', async () => {
    const repository = createRepository(createCours(false, TEACHER_ID))
    const service = new CoursService(repository)

    await service.updateCoursPartiellement(
      'cours-id',
      { level: 'intermedaire' },
      { userId: ADMIN_ID, name: 'Administrateur', role: 'admin' },
    )

    expect(repository.update).toHaveBeenCalledWith('cours-id', {
      level: 'intermedaire',
      published: false,
    })
  })

  it('crée un cours pour le professeur connecté après validation de son compte', async () => {
    const repository = createRepository(null)
    const users: Pick<IUserRepository, 'findById'> = {
      findById: vi.fn().mockResolvedValue({
        id: TEACHER_ID,
        role: 'teacher',
        isActive: true,
      }),
    }
    const service = new CoursService(repository, undefined, undefined, users)

    await service.createCours({
      name: 'Nouveau cours',
      description: 'Description',
      proffesseur: TEACHER_ID,
      capacite: 50,
      lieu: 'Salle A',
      category: 'web',
    }, { userId: TEACHER_ID, role: 'teacher' })

    expect(users.findById).toHaveBeenCalledWith(TEACHER_ID)
    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
      proffesseur: TEACHER_ID,
      name: 'Nouveau cours',
    }))
  })

  it('refuse à un professeur de créer un cours attribué à quelqu’un d’autre', async () => {
    const repository = createRepository(null)
    const users: Pick<IUserRepository, 'findById'> = {
      findById: vi.fn(),
    }
    const service = new CoursService(repository, undefined, undefined, users)

    await expect(service.createCours({
      name: 'Nouveau cours',
      description: 'Description',
      proffesseur: ADMIN_ID,
      capacite: 50,
      lieu: 'Salle A',
      category: 'web',
    }, { userId: TEACHER_ID, role: 'teacher' })).rejects.toMatchObject({ status: 403 })
    expect(users.findById).not.toHaveBeenCalled()
    expect(repository.create).not.toHaveBeenCalled()
  })

  it('autorise un admin à attribuer un cours à un autre professeur', async () => {
    const repository = createRepository(null)
    const users: Pick<IUserRepository, 'findById'> = {
      findById: vi.fn().mockResolvedValue({
        id: TEACHER_ID,
        role: 'teacher',
        isActive: true,
      }),
    }
    const service = new CoursService(repository, undefined, undefined, users)

    await service.createCours({
      name: 'Nouveau cours',
      description: 'Description',
      proffesseur: TEACHER_ID,
      capacite: 50,
      lieu: 'Salle A',
      category: 'web',
    }, { userId: ADMIN_ID, role: 'admin' })

    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
      proffesseur: TEACHER_ID,
    }))
  })
})