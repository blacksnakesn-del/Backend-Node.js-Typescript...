import { Request, Response } from "express";
import { sendError, sendSuccess } from "../../shared/api-response.js";
import { ModuleService } from "./module.service.js";
import type { CreateModuleRecord } from "./module.schema.js";

export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  async createModule(request: Request, response: Response) {
    const input = request.validated?.body as CreateModuleRecord;
    const module = await this.moduleService.createModule(input);
    return sendSuccess(response, module, 201);
  }

  async getModuleById(request: Request, response: Response) {
    const { id } = request.validated?.params as { id: string };
    const module = await this.moduleService.getModuleById(id);
    if (!module) {
      return sendError(response, "Module not found", 404);
    }
    return sendSuccess(response, module);
  }

  async listModules(request: Request, response: Response) {
    const modules = await this.moduleService.listModules();
    return sendSuccess(response, modules);
  }

  async deleteModule(request: Request, response: Response) {
    const { id } = request.validated?.params as { id: string };
    await this.moduleService.deleteModule(id);
    return sendSuccess(response, null, 204);
  }
}