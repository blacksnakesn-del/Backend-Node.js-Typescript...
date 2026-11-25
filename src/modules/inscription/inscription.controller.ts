import type { Request, Response } from 'express'
import { sendSuccess } from '../../shared/api-response.js'
import { UnauthorizedError } from '../../shared/errors.js'
import { InscriptionService } from './inscription.service.js'
import type {
  EnrollLearnerInput,
  LessonProgressInput,
  ProfessorStudentsQuery,
} from './inscription.schema.js'

export class InscriptionController {
  constructor(private readonly inscriptionService: InscriptionService) {}

  async autoEnroll(request: Request, response: Response) {
    const { courseId } = request.validated?.params as { courseId: string }
    const userId = request.auth?.userId
    if (!userId) throw new UnauthorizedError()

    const inscription = await this.inscriptionService.enroll(courseId, userId)
    return sendSuccess(response, inscription.toSafeJSON(), 201)
  }

  async enrollLearner(request: Request, response: Response) {
    const { courseId } = request.validated?.params as { courseId: string }
    const { userId } = request.validated?.body as EnrollLearnerInput
    const inscription = await this.inscriptionService.enroll(courseId, userId)
    return sendSuccess(response, inscription.toSafeJSON(), 201)
  }

  async listCourseEnrollments(request: Request, response: Response) {
    const { courseId } = request.validated?.params as { courseId: string }
    const inscriptions = await this.inscriptionService.getCourseEnrollments(courseId)
    return sendSuccess(response, inscriptions.map((inscription) => inscription.toSafeJSON()))
  }

  async listMyEnrollments(request: Request, response: Response) {
    const userId = request.auth?.userId
    if (!userId) throw new UnauthorizedError()

    const inscriptions = await this.inscriptionService.getMyEnrollments(userId)
    return sendSuccess(response, inscriptions.map((inscription) => inscription.toSafeJSON()))
  }

  async listTopLearners(request: Request, response: Response) {
    const { rang } = request.validated?.params as { rang: number }
    const learners = await this.inscriptionService.getTopLearners(rang)
    return sendSuccess(response, learners)
  }

  async listProfessorStudents(request: Request, response: Response) {
    const { idProffesseur } = request.validated?.params as { idProffesseur: string }
    const query = request.validated?.query as ProfessorStudentsQuery
    const actor = request.auth
    if (!actor) throw new UnauthorizedError()

    const result = await this.inscriptionService.getProfessorStudents(
      idProffesseur,
      actor.userId,
      { page: query.page, perPage: query.per_page },
    )
    return sendSuccess(response, result.students, 200, result.pagination)
  }

  async updateLessonProgress(request: Request, response: Response) {
    const { enrollmentId, lessonId } = request.validated?.params as {
      enrollmentId: string
      lessonId: string
    }
    const { progress } = request.validated?.body as LessonProgressInput
    const userId = request.auth?.userId
    if (!userId) throw new UnauthorizedError()

    const record = await this.inscriptionService.updateLessonProgress(
      enrollmentId,
      lessonId,
      userId,
      progress,
    )
    return sendSuccess(response, record.toSafeJSON())
  }
}
