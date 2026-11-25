import { Cours } from '../cours/cours.models.js'
import { CoursRepository, type CreateCoursRecord, type ICoursRepository, type ListCoursInput } from '../cours/cours.repository.js'
import { ModuleRepository, type IModuleRepository } from '../module/module.repositry.js'
import type { CreateModuleInput } from '../module/module.schema.js'
import {
  LeconsRepository,
  type CreateLeconsRecord,
  type ILeconsRepository,
} from '../lecons/lecons.repository.js'
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../../shared/errors.js'
import type { CourseCategory } from './cours.constants.js'
import type { UpdateCoursPartiellementInput } from './cours.schema.js'
import type { UserRole } from '../users/user.model.js'
import { UserRepository, type IUserRepository } from '../users/user.repository.js'

export class CoursService {
  constructor(
    private readonly coursRepository: ICoursRepository = new CoursRepository(),
    private readonly moduleRepository: IModuleRepository = new ModuleRepository(),
    private readonly leconsRepository: ILeconsRepository = new LeconsRepository(),
    private readonly users: Pick<IUserRepository, 'findById'> = new UserRepository(),
  ) {}

  async createCours(
    data: CreateCoursRecord,
    actor: { userId: string; role: UserRole },
  ): Promise<Cours> {
    if (actor.role === 'teacher' && data.proffesseur !== actor.userId) {
      throw new ForbiddenError('Un professeur ne peut créer un cours que pour lui-même.')
    }

    const professor = await this.users.findById(data.proffesseur)
    if (!professor) throw new NotFoundError('Professeur introuvable.')
    if (professor.role !== 'teacher' || !professor.isActive) {
      throw new BadRequestError('Le professeur du cours doit être un compte enseignant actif.')
    }

    const existingCours = await this.coursRepository.findByNom(data.name)
    if (existingCours) {
      throw new ConflictError('Un cours avec ce nom existe déjà.')
    }
    return this.coursRepository.create(data)
  }

  async listerCours(): Promise<Cours[]> {
    return this.coursRepository.findAll()
  }

  async list(input: ListCoursInput) {
    const result = await this.coursRepository.list(input)
    return {
      courses: result.rows,
      pagination: {
        page: input.page,
        per_page: input.perPage,
        total: result.count,
        total_pages: Math.ceil(result.count / input.perPage),
      },
    }
  }

  async showDeatilsCours(id: string): Promise<Cours | null> {
    return this.coursRepository.findById(id)
  }

  async getCoursById(id: string): Promise<Cours | null> {
    return this.coursRepository.findById(id)
  }

  async getCoursByNom(nom: string): Promise<Cours | null> {
    return this.coursRepository.findByNom(nom)
  }

  async updateCoursPartiellement(
    id: string,
    data: UpdateCoursPartiellementInput,
    actor: { userId: string; name: string; role: UserRole },
  ): Promise<Cours> {
    const cours = await this.coursRepository.findById(id)
    if (!cours) throw new NotFoundError('Cours introuvable.')
    if (actor.role !== 'admin' && cours.proffesseur !== actor.userId) {
      throw new ForbiddenError('Vous ne pouvez modifier que vos propres cours.')
    }

    const { title, ...fields } = data
    const updatedCours = await this.coursRepository.update(id, {
      ...fields,
      ...(title === undefined ? {} : { name: title }),
      published: false,
    })
    if (!updatedCours) throw new NotFoundError('Cours introuvable.')
    return updatedCours
  }

  async publierCours(id: string): Promise<Cours> {
    const cours = await this.coursRepository.findById(id)
    if (!cours) throw new NotFoundError('Cours introuvable.')
    const updatedCours = await this.coursRepository.updatePublished(id, true)
    if (!updatedCours) throw new NotFoundError('Cours introuvable.')
    return updatedCours
  }

  async listerCoursParCategorie(category: CourseCategory): Promise<Cours[]> {
    return this.coursRepository.findByCategory(category)
  }

  async ajouterModuleAuCours(coursId: string, data: CreateModuleInput) {
    const cours = await this.coursRepository.findById(coursId)
    if (!cours) throw new NotFoundError('Cours introuvable.')
    return this.moduleRepository.create({ ...data, coursId })
  }

  async ajouterLeconAuModule(moduleId: string, data: CreateLeconsRecord) {
    const module = await this.moduleRepository.findById(moduleId)
    if (!module) throw new NotFoundError('Module introuvable.')
    return this.leconlsRepository.create({ ...data, moduleId })
  }

  async deleteCours(id: string): Promise<void> {
    const cours = await this.coursRepository.findById(id)
    if (!cours) throw new NotFoundError('Cours introuvable.')
    if (cours.published) {
      throw new ConflictError('Seuls les brouillons peuvent être supprimés.')
    }
    await this.coursRepository.delete(id)
  }
  
  async rechercherCoursParNomOuDescription(terme: string): Promise<Cours[]> {
    const cours = await this.coursRepository.findAll()
    return cours.filter(
      (c) =>
        c.name.toLowerCase().includes(terme.toLowerCase()) ||
        c.description.toLowerCase().includes(terme.toLowerCase()),
    )
  }
 
}