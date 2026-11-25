import { Router } from 'express'
import { authenticate, authorize, requireVerifiedEmail } from '../../middlewares/authenticate.js'
import { validateBody, validateParams, validateQuery } from '../../middlewares/validate.js'
import { asyncHandler } from '../../shared/async-handler.js'
import { InscriptionController } from './inscription.controller.js'
import {
  courseIdParamsSchema,
  enrollLearnerSchema,
  lessonProgressParamsSchema,
  lessonProgressSchema,
  professorStudentsParamsSchema,
  professorStudentsQuerySchema,
  topLearnersParamsSchema,
} from './inscription.schema.js'
import { InscriptionService } from './inscription.service.js'

const inscriptionController = new InscriptionController(new InscriptionService())

export const inscriptionRouter = Router()

inscriptionRouter.get(
  '/learners/top/:rang',
  authenticate,
  requireVerifiedEmail,
  authorize('admin', 'teacher'),
  validateParams(topLearnersParamsSchema),
  asyncHandler(inscriptionController.listTopLearners.bind(inscriptionController)),
)

inscriptionRouter.get(
  '/students/proffesseur/:idProffesseur',
  authenticate,
  requireVerifiedEmail,
  authorize('teacher'),
  validateParams(professorStudentsParamsSchema),
  validateQuery(professorStudentsQuerySchema),
  asyncHandler(inscriptionController.listProfessorStudents.bind(inscriptionController)),
)

inscriptionRouter.post(
  '/courses/:courseId/enroll',
  authenticate,
  requireVerifiedEmail,
  authorize('learner'),
  validateParams(courseIdParamsSchema),
  asyncHandler(inscriptionController.autoEnroll.bind(inscriptionController)),
)

inscriptionRouter.get(
  '/courses/:courseId/enrollments',
  authenticate,
  requireVerifiedEmail,
  authorize('admin', 'teacher'),
  validateParams(courseIdParamsSchema),
  asyncHandler(inscriptionController.listCourseEnrollments.bind(inscriptionController)),
)

inscriptionRouter.post(
  '/courses/:courseId/enrollments',
  authenticate,
  requireVerifiedEmail,
  authorize('admin', 'teacher'),
  validateParams(courseIdParamsSchema),
  validateBody(enrollLearnerSchema),
  asyncHandler(inscriptionController.enrollLearner.bind(inscriptionController)),
)

inscriptionRouter.get(
  '/enrollments/me',
  authenticate,
  requireVerifiedEmail,
  asyncHandler(inscriptionController.listMyEnrollments.bind(inscriptionController)),
)

inscriptionRouter.put(
  '/enrollments/:enrollmentId/lessons/:lessonId/progress',
  authenticate,
  requireVerifiedEmail,
  authorize('learner'),
  validateParams(lessonProgressParamsSchema),
  validateBody(lessonProgressSchema),
  asyncHandler(inscriptionController.updateLessonProgress.bind(inscriptionController)),
)