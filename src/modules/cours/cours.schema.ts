import { z } from 'zod'
import { COURSE_CATEGORIES, COURSE_LEVELS } from './cours.constants.js'

const courseCategorySchema = z.enum(COURSE_CATEGORIES)
const courseLevelSchema = z.enum(COURSE_LEVELS)

export const createCoursSchema = z.object({
  name: z.string().default("Nom du Cours"),
  description: z.string().max(250),
  proffesseur: z.string().uuid(),
  capacite: z.number().min(50),
  lieu: z.string(),
  category: courseCategorySchema.default('web'),
})

export const updateCoursSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().max(250).optional(),
    summary: z.string().optional(),
    level: courseLevelSchema.optional(),
  })
  .strict()
  .refine((data) => {
    const fieldCount = Object.keys(data).length
    return fieldCount >= 1 && fieldCount <= 3
  }, {
    message: 'Entre un et trois champs modifiables doivent être fournis.',
  })

export const updateCoursPartiellementSchema = updateCoursSchema

export const createCoursModuleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  nombreLecons: z.number().int().positive(),
})

export const createCoursLessonSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  duree: z.string().min(1),
})


export const listerCoursSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(100).optional(),
  proffesseur: z.string().uuid().optional(),
  capacite: z.coerce.number().int().optional(),
  lieu: z.string().trim().min(1).optional(),
  category: courseCategorySchema.optional(),
  published: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
})

export const CoursIsParamSchema = z.object({
  id: z.string().uuid()
})

export const CoursIdParamSchema = z.object({
  idCours: z.string().uuid(),
})

export const ModuleIsParamSchema = z.object({
  moduleId: z.string().uuid(),
})

export type CreateCoursInput = z.infer<typeof createCoursSchema>
export type UpdateCoursInput = z.infer<typeof updateCoursSchema>
export type ListerCoursInput = z.infer<typeof listerCoursSchema>
export type CoursIsParamInput = z.infer<typeof CoursIsParamSchema>
export type UpdateCoursPartiellementInput = z.infer<typeof updateCoursPartiellementSchema>