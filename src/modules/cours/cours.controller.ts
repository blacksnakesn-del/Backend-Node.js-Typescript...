import { Request, Response } from 'express'
import { sendError, sendSuccess } from '../../shared/api-response.js'
import { CoursService } from './cours.service.js'
import type { CreateLeconsRecord } from '../lecons/lecons.repository.js'
import type { CreateModuleInput } from '../module/module.schema.js'
import type { CourseCategory } from './cours.constants.js'
import type { CreateCoursInput, UpdateCoursPartiellementInput } from './cours.schema.js'

export class CoursController {
  constructor(private readonly coursService: CoursService) {}

  // async listerCours(_request: Request, response: Response) {
  //   const cours = await this.coursService.listerCours()
  //   return sendSuccess(response, cours)
  // }

  async listerCours(request: Request, response: Response, next: Function) {
    const query = request.validated?.query as {
      page: number
      per_page: number
      search?: string
      proffesseur?: string
      capacite?: number
      lieu?: string
      category?: CourseCategory
      published?: boolean
    }
    const result = await this.coursService.list({
      page: query.page,
      perPage: query.per_page,
      search: query.search,
      proffesseur: query.proffesseur,
      capacite: query.capacite,
      lieu: query.lieu,
      category: query.category,
      published: query.published,
    })
    const utilisateur = request.auth!
    return sendSuccess(response, result.courses, 200, {
      ...result.pagination,
      utilisateur: {
        id: utilisateur.userId,
        name: utilisateur.name,
        email: utilisateur.email,
        role: utilisateur.role,
        email_verified: utilisateur.emailVerifiedAt !== null,
      },
    })
  }

  async createCours(request: Request, response: Response) {
    const input = request.validated?.body as CreateCoursInput
    const cours = await this.coursService.createCours(
      input,
      request.auth!,
    )
    return sendSuccess(response, cours, 201)
  }

  async getCoursById(request: Request, response: Response) {
    const { id } = request.validated?.params as { id: string }
    const cours = await this.coursService.getCoursById(id)
    if (!cours) {
      return sendError(response, 'Cours not found', 404)
    }
    return sendSuccess(response, cours)
  }

  async getCoursByNom(request: Request, response: Response) {
    const { nom } = request.validated?.params as { nom: string }
    const cours = await this.coursService.getCoursByNom(nom)
    if (!cours) {
      return sendError(response, 'Cours not found', 404)
    }
    return sendSuccess(response, cours)
  }

  async updateCoursPartiellement(request: Request, response: Response) {
    const { idCours } = request.validated?.params as { idCours: string }
    const input = request.validated?.body as UpdateCoursPartiellementInput
    const updatedCours = await this.coursService.updateCoursPartiellement(
      idCours,
      input,
      request.auth!,
    )
    return sendSuccess(response, updatedCours)
  }

  async publierCours(request: Request, response: Response) {
    const { id } = request.validated?.params as { id: string }
    const cours = await this.coursService.publierCours(id)
    return sendSuccess(response, cours)
  }

  async ajouterModule(request: Request, response: Response) {
    const { id } = request.validated?.params as { id: string }
    const input = request.validated?.body as CreateModuleInput
    const module = await this.coursService.ajouterModuleAuCours(id, input)
    return sendSuccess(response, module, 201)
  }

  async ajouterLecon(request: Request, response: Response) {
    const { moduleId } = request.validated?.params as { moduleId: string }
    const input = request.validated?.body as { title: string; content?: string; duree: string }
    const lecon: CreateLeconsRecord = {
      name: input.title,
      description: input.content,
      duree: input.duree,
      moduleId,
    }
    const createdLecon = await this.coursService.ajouterLeconAuModule(moduleId, lecon)
    return sendSuccess(response, createdLecon, 201)
  }

  async deleteCours(request: Request, response: Response) {
    const { id } = request.validated?.params as { id: string }
    await this.coursService.deleteCours(id)
    return sendSuccess(response, null, 204)
  }

  async rechercherCoursParNomOuDescription(request: Request, response: Response) {
    const { terme } = request.query as { terme: string }
    const cours = await this.coursService.rechercherCoursParNomOuDescription(terme)
    return sendSuccess(response, cours)
  }
}