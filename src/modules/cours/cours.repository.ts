import { Cours } from '../cours/cours.models.js'
import { Op, type WhereOptions } from 'sequelize'
import type { CourseCategory, CourseLevel } from './cours.constants.js'

export interface ListCoursInput {
  page: number
  perPage: number
  search?: string
  proffesseur?: string
  capacite?: number
  lieu?: string
  category?: CourseCategory
  published?: boolean
}

export interface ICoursRepository {
  findById(id: string): Promise<Cours | null>
  findByNom(nom: string): Promise<Cours | null>
  findAll(): Promise<Cours[]>
  list(input: ListCoursInput): Promise<{ rows: Cours[]; count: number }>
  findByCategory(category: CourseCategory): Promise<Cours[]>
  create(data: CreateCoursRecord): Promise<Cours>
  update(id: string, data: UpdateCoursRecord): Promise<Cours | null>
  updatePublished(id: string, published: boolean): Promise<Cours | null>
  delete(id: string): Promise<void>
}

export interface CreateCoursRecord {
  name: string
  description: string
  proffesseur: string
  capacite: number
  lieu: string
  category: CourseCategory
}

export type UpdateCoursRecord = Partial<CreateCoursRecord> & {
  summary?: string | null
  level?: CourseLevel | null
  published?: boolean
}

export class CoursRepository implements ICoursRepository {
  async findById(id: string): Promise<Cours | null> {
    return Cours.findByPk(id)
  }

  async findAll(): Promise<Cours[]> {
    return Cours.findAll()
  }

  async list(input: ListCoursInput): Promise<{ rows: Cours[]; count: number }> {
    const where: WhereOptions = {
      ...(input.proffesseur ? { proffesseur: input.proffesseur } : {}),
      ...(input.lieu ? { lieu: input.lieu } : {}),
      ...(input.category ? { category: input.category } : {}),
      ...(input.capacite === undefined ? {} : { capacite: input.capacite }),
      ...(input.published === undefined ? {} : { published: input.published }),
      ...(input.search
        ? {
            [Op.or]: [
              { name: { [Op.like]: `%${input.search}%` } },
              { description: { [Op.like]: `%${input.search}%` } },
            ],
          }
        : {}),
    }

    const result = await Cours.findAndCountAll({
      where,
      limit: input.perPage,
      offset: (input.page - 1) * input.perPage,
      order: [['createdAt', 'DESC']],
    })
    return { rows: result.rows, count: result.count }
  }

  async findByNom(nom: string): Promise<Cours | null> {
    return Cours.findOne({ where: { name: nom } })
  }

  async create(data: CreateCoursRecord): Promise<Cours> {
    return Cours.create(data)
  }

  async update(id: string, data: UpdateCoursRecord): Promise<Cours | null> {
    const cours = await this.findById(id)
    if (!cours) return null
    Object.assign(cours, data)
    await cours.save()
    return cours
  }

  async findByCategory(category: CourseCategory): Promise<Cours[]> {
    return Cours.findAll({ where: { category } })
  }

  async updatePublished(id: string, published: boolean): Promise<Cours | null> {
    const cours = await this.findById(id)
    if (!cours) return null
    cours.published = published
    await cours.save()
    return cours
  }

  async delete(id: string): Promise<void> {
    const cours = await this.findById(id)
    if (!cours) return
    await cours.destroy()
  }
}