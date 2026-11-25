import { LeconsService } from './lecons.service.js'
import { validateBody, validateParams } from '../../middlewares/validate.js'
import { leconSchema, LeconIsParamSchema } from './lecons.schema.js'
import { Router } from 'express'
import { asyncHandler } from '../../shared/async-handler.js'
import { LeconsController } from './lecons.controller.js'

const leconsService = new LeconsService()
const leconsController = new LeconsController(leconsService)

export const leconsRouter = Router()

leconsRouter.post(
  '/lecons',
  validateBody(leconSchema),
  asyncHandler(leconsController.createLecons.bind(leconsController)),
)

leconsRouter.get(
  '/lecons/:id',
  validateParams(LeconIsParamSchema),
  asyncHandler(leconsController.getLeconsById.bind(leconsController)),
)

leconsRouter.patch(
  '/lecons/:id/title',
  validateParams(LeconIsParamSchema),
  validateBody(leconSchema.pick({ title: true })),
  asyncHandler(leconsController.updateLeconsTitle.bind(leconsController)),
)

leconsRouter.patch(
  '/lecons/:id/content',
  validateParams(LeconIsParamSchema),
  validateBody(leconSchema.pick({ content: true })),
  asyncHandler(leconsController.updateLeconsContent.bind(leconsController)),
)

leconsRouter.patch(
  '/lecons/:id/duree',
  validateParams(LeconIsParamSchema),
  validateBody(leconSchema.pick({ duree: true })),
  asyncHandler(leconsController.updateLeconsDuree.bind(leconsController)),
)

leconsRouter.delete(
  '/lecons/:id',
  validateParams(LeconIsParamSchema),
  asyncHandler(leconsController.deleteLecons.bind(leconsController)),
)