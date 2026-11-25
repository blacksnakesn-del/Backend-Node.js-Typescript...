import { ModuleController } from '../module/module.controller.js';
import { ModuleService } from '../module/module.service.js';
import { validateBody, validateParams } from "../../middlewares/validate.js";
import { moduleSchema } from "./module.schema.js";
import { Router } from "express";
import { asyncHandler } from '../../shared/async-handler.js';
import { z } from "zod";

const moduleService = new ModuleService();
const moduleController = new ModuleController(moduleService);

export const moduleRouter = Router();

moduleRouter.post(
  "/modules",
  validateBody(moduleSchema),
  asyncHandler(moduleController.createModule.bind(moduleController))
);

moduleRouter.get(
  "/modules/:id",
  validateParams(z.object({ id: z.string().uuid() })),
  asyncHandler(moduleController.getModuleById.bind(moduleController))
);

moduleRouter.get(
  "/modules",
  asyncHandler(moduleController.listModules.bind(moduleController))
);

moduleRouter.delete(
  "/modules/:id",
  validateParams(z.object({ id: z.string().uuid() })),
  asyncHandler(moduleController.deleteModule.bind(moduleController))
);