 import { Router } from 'express'
import { asyncHandler } from '../../shared/async-handler.js'
import { CoursController } from './cours.controller.js'
import { CoursService } from './cours.service.js'
import { validateBody, validateParams, validateQuery } from '../../middlewares/validate.js'
import {
  createCoursSchema,
  createCoursLessonSchema,
  createCoursModuleSchema,
  CoursIsParamSchema,
  ModuleIsParamSchema,
  listerCoursSchema,
  CoursIdParamSchema,
  updateCoursPartiellementSchema,
} from './cours.schema.js'
import { authenticate, authorize } from '../../middlewares/authenticate.js'

const coursService = new CoursService()
const coursController = new CoursController(coursService)

export const coursRouteur = Router()

coursRouteur.get(
  '/courses',
  validateQuery(listerCoursSchema),
  authenticate,
  asyncHandler(coursController.listerCours.bind(coursController)),
)
 
coursRouteur.patch(
  '/courses/:idCours',
  authenticate,
  authorize('teacher', 'admin'),
  validateParams(CoursIdParamSchema),
  validateBody(updateCoursPartiellementSchema),
  asyncHandler(coursController.updateCoursPartiellement.bind(coursController)),
)

coursRouteur.patch(
  '/test/courses/:idCours',
  authenticate,
  authorize('teacher', 'admin'),
  validateParams(CoursIdParamSchema),
  validateBody(updateCoursPartiellementSchema),
  asyncHandler(coursController.updateCoursPartiellement.bind(coursController)),
)

// coursRouteur.get(
//   '/courses',
//   validateParams(CoursIsParamSchema),
//   asyncHandler(coursController.listerCours.bind(coursController)),
// )

// coursRouteur.get(
//   '/courses',
//   validateParams(CoursIsParamSchema),
//   asyncHandler(coursController.listerCours.bind(coursController)),
// )

coursRouteur.post(
  '/courses',
  authenticate,
  authorize('teacher', 'admin'),
  validateBody(createCoursSchema),
  asyncHandler(coursController.createCours.bind(coursController)),
)

coursRouteur.get(
  '/courses/:id',
  validateParams(CoursIsParamSchema),
  asyncHandler(coursController.getCoursById.bind(coursController)),
)

coursRouteur.patch(
  '/courses/:id/publish',
  validateParams(CoursIsParamSchema),
  asyncHandler(coursController.publierCours.bind(coursController)),
)

coursRouteur.post(
  '/courses/:id/modules',
  validateParams(CoursIsParamSchema),
  validateBody(createCoursModuleSchema),
  asyncHandler(coursController.ajouterModule.bind(coursController)),
)

coursRouteur.post(
  '/courses/modules/:moduleId/lessons',
  validateParams(ModuleIsParamSchema),
  validateBody(createCoursLessonSchema),
  asyncHandler(coursController.ajouterLecon.bind(coursController)),
)

coursRouteur.delete(
  '/courses/:id',
  validateParams(CoursIsParamSchema),
  asyncHandler(coursController.deleteCours.bind(coursController)),
)
