import { col, fn, type Transaction } from 'sequelize'
import { Cours } from '../cours/cours.models.js'
import { User } from '../users/user.model.js'
import { Inscription } from './inscription.model.js'

export interface CreateInscriptionRecord {
  coursId: string
  userId: string
}

export interface ProfessorStudent {
  id: string
  name: string
  email: string
  courses_followed: number
}

export interface TopLearner {
  name: string
  email: string
  enrollment_count: number
}

export interface IInscriptionRepository {
  create(data: CreateInscriptionRecord, transaction?: Transaction): Promise<Inscription>
  findById(id: string): Promise<Inscription | null>
  findByCoursId(coursId: string): Promise<Inscription[]>
  findByUserId(userId: string): Promise<Inscription[]>
  findByCoursAndUser(coursId: string, userId: string, transaction?: Transaction): Promise<Inscription | null>
  countByCoursId(coursId: string, transaction?: Transaction): Promise<number>
  listTopLearners(rang: number): Promise<TopLearner[]>
  listStudentsByProfessorId(
    professorId: string,
    input: { page: number; perPage: number },
  ): Promise<{ rows: ProfessorStudent[]; count: number }>
}

export class InscriptionRepository implements IInscriptionRepository {
  async create(data: CreateInscriptionRecord, transaction?: Transaction): Promise<Inscription> {
    return Inscription.create(data, { transaction })
  }

  async findById(id: string): Promise<Inscription | null> {
    return Inscription.findByPk(id)
  }

  async findByCoursId(coursId: string): Promise<Inscription[]> {
    return Inscription.findAll({
      where: { coursId },
      order: [['dateInscription', 'ASC']],
    })
  }

  async findByUserId(userId: string): Promise<Inscription[]> {
    return Inscription.findAll({
      where: { userId },
      order: [['dateInscription', 'DESC']],
    })
  }

  async findByCoursAndUser(
    coursId: string,
    userId: string,
    transaction?: Transaction,
  ): Promise<Inscription | null> {
    return Inscription.findOne({
      where: { coursId, userId },
      transaction,
    })
  }

  async countByCoursId(coursId: string, transaction?: Transaction): Promise<number> {
    return Inscription.count({ where: { coursId }, transaction })
  }

  async listTopLearners(rang: number): Promise<TopLearner[]> {
    const records = await User.findAll({
      attributes: [
        'name',
        'email',
        [fn('COUNT', col('inscriptions.id')), 'enrollment_count'],
      ],
      where: { role: 'learner' },
      include: [{ model: Inscription, as: 'inscriptions', attributes: [], required: true }],
      group: ['User.id', 'User.name', 'User.email'],
      order: [
        [fn('COUNT', col('inscriptions.id')), 'DESC'],
        ['name', 'ASC'],
        ['id', 'ASC'],
      ],
      limit: rang,
      subQuery: false,
    })

    return records.map((record) => ({
      name: record.name,
      email: record.email,
      enrollment_count: Number(record.get('enrollment_count')),
    }))
  }

  async listStudentsByProfessorId(
    professorId: string,
    input: { page: number; perPage: number },
  ): Promise<{ rows: ProfessorStudent[]; count: number }> {
    const include = [
      {
        model: Inscription,
        as: 'inscriptions',
        attributes: [],
        required: true,
        include: [
          {
            model: Cours,
            as: 'cours',
            attributes: [],
            where: { proffesseur: professorId },
            required: true,
          },
        ],
      },
    ]
    const records = await User.findAll({
      attributes: [
        'id',
        'name',
        'email',
        [fn('COUNT', fn('DISTINCT', col('inscriptions.cours.id'))), 'courses_followed'],
      ],
      where: { role: 'learner' },
      include,
      group: ['User.id', 'User.name', 'User.email'],
      order: [
        ['name', 'ASC'],
        ['id', 'ASC'],
      ],
      limit: input.perPage,
      offset: (input.page - 1) * input.perPage,
      subQuery: false,
    })
    const count = await User.count({
      where: { role: 'learner' },
      include,
      distinct: true,
      col: 'id',
    })

    return {
      rows: records.map((record) => ({
        id: record.id,
        name: record.name,
        email: record.email,
        courses_followed: Number(record.get('courses_followed')),
      })),
      count,
    }
  }
}
