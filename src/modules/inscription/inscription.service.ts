import { sequelize } from '../../database/sequelize.js'
import { ConflictError, ForbiddenError, NotFoundError } from '../../shared/errors.js'
import { Cours } from '../cours/cours.models.js'
import { Lecons } from '../lecons/lecons.model.js'
import { Module } from '../module/module.model.js'
import { User } from '../users/user.model.js'
import { InscriptionProgressRepository, type IInscriptionProgressRepository } from './inscription-progress.repository.js'
import { InscriptionProgress } from './inscription-progress.model.js'
import { Inscription } from './inscription.model.js'
import {
  InscriptionRepository,
  type IInscriptionRepository,
} from './inscription.repository.js'

export class InscriptionService {
  constructor(
    private readonly inscriptions: IInscriptionRepository = new InscriptionRepository(),
    private readonly progressions: IInscriptionProgressRepository = new InscriptionProgressRepository(),
  ) {}

  async enroll(coursId: string, userId: string): Promise<Inscription> {
    return sequelize.transaction(async (transaction) => {
      const cours = await Cours.findByPk(coursId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      })
      if (!cours) throw new NotFoundError('Cours introuvable.')
      if (!cours.published) {
        throw new ConflictError('Ce cours n’est pas encore ouvert aux inscriptions.')
      }

      const user = await User.findByPk(userId, { transaction })
      if (!user) throw new NotFoundError('Utilisateur introuvable.')
      if (!user.isActive || user.role !== 'learner') {
        throw new ForbiddenError('Seul un apprenant actif peut être inscrit.')
      }

      const existing = await this.inscriptions.findByCoursAndUser(coursId, userId, transaction)
      if (existing) throw new ConflictError('Cet apprenant est déjà inscrit à ce cours.')

      const currentEnrollmentCount = await this.inscriptions.countByCoursId(coursId, transaction)
      if (!Number.isInteger(cours.capacite) || currentEnrollmentCount >= cours.capacite) {
        throw new ConflictError('La capacité maximale du cours est atteinte.')
      }

      return this.inscriptions.create({ coursId, userId }, transaction)
    })
  }

  async getCourseEnrollments(coursId: string): Promise<Inscription[]> {
    const cours = await Cours.findByPk(coursId)
    if (!cours) throw new NotFoundError('Cours introuvable.')
    return this.inscriptions.findByCoursId(coursId)
  }

  async getMyEnrollments(userId: string): Promise<Inscription[]> {
    return this.inscriptions.findByUserId(userId)
  }

  async getTopLearners(rang: number) {
    return this.inscriptions.listTopLearners(rang)
  }

  async getProfessorStudents(
    professorId: string,
    actorId: string,
    input: { page: number; perPage: number },
  ) {
    if (professorId !== actorId) {
      throw new ForbiddenError('Vous ne pouvez consulter que les étudiants de vos propres cours.')
    }

    const result = await this.inscriptions.listStudentsByProfessorId(professorId, input)
    return {
      students: result.rows,
      pagination: {
        page: input.page,
        per_page: input.perPage,
        total: result.count,
        total_pages: Math.ceil(result.count / input.perPage),
      },
    }
  }

  async updateLessonProgress(
    enrollmentId: string,
    lessonId: string,
    userId: string,
    progress: number,
  ): Promise<InscriptionProgress> {
    const enrollment = await this.inscriptions.findById(enrollmentId)
    if (!enrollment) throw new NotFoundError('Inscription introuvable.')
    if (enrollment.userId !== userId) {
      throw new ForbiddenError('Vous ne pouvez modifier que votre propre progression.')
    }

    const lesson = await Lecons.findByPk(lessonId)
    if (!lesson) throw new NotFoundError('Leçon introuvable.')
    const module = await Module.findByPk(lesson.moduleId)
    if (!module || module.coursId !== enrollment.coursId) {
      throw new NotFoundError('Cette leçon ne fait pas partie du cours de cette inscription.')
    }

    return this.progressions.setProgress(enrollmentId, lessonId, progress)
  }
}
