import type { Request, Response } from 'express'
import { sendError, sendSuccess } from '../../shared/api-response.js'
import { LeconsService } from './lecons.service.js'
import type { CreateLeconRecord } from './lecons.schema.js'
import type { CreateLeconsRecord } from './lecons.repository.js'

export class LeconsController {
  constructor(private readonly leconsService: LeconsService) {}

  async createLecons(request: Request, response: Response) {
    const input = request.validated?.body as CreateLeconRecord
    const record: CreateLeconsRecord = {
      name: input.title,
      description: input.content,
      duree: input.duree,
      moduleId: input.moduleId,
    }
    const lecon = await this.leconsService.createLecons(record)
    return sendSuccess(response, lecon, 201)
  }

  async getLeconsById(request: Request, response: Response) {
    const { id } = request.validated?.params as { id: string }
    const lecon = await this.leconsService.getLeconsById(id)
    if (!lecon) return sendError(response, 'Leçon introuvable.', 404)
    return sendSuccess(response, lecon)
  }

  async updateLeconsTitle(request: Request, response: Response) {
    const { id } = request.validated?.params as { id: string }
    const { title } = request.validated?.body as { title: string }
    const lecon = await this.leconsService.updateLeconsName(id, title)
    if (!lecon) return sendError(response, 'Leçon introuvable.', 404)
    return sendSuccess(response, lecon)
  }

  async updateLeconsContent(request: Request, response: Response) {
    const { id } = request.validated?.params as { id: string }
    const { content } = request.validated?.body as { content: string }
    const lecon = await this.leconsService.updateLeconsDescription(id, content)
    if (!lecon) return sendError(response, 'Leçon introuvable.', 404)
    return sendSuccess(response, lecon)
  }

  async updateLeconsDuree(request: Request, response: Response) {
    const { id } = request.validated?.params as { id: string }
    const { duree } = request.validated?.body as { duree: string }
    const lecon = await this.leconsService.updateLeconsDuree(id, duree)
    if (!lecon) return sendError(response, 'Leçon introuvable.', 404)
    return sendSuccess(response, lecon)
  }

  async deleteLecons(request: Request, response: Response) {
    const { id } = request.validated?.params as { id: string }
    await this.leconsService.deleteLecons(id)
    return sendSuccess(response, null, 204)
  }
}