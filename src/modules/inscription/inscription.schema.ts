import { z } from 'zod'

export const courseIdParamsSchema = z.object({
  courseId: z.string().uuid(),
})

export const professorStudentsParamsSchema = z.object({
  idProffesseur: z.string().uuid(),
})

export const topLearnersParamsSchema = z.object({
  rang: z.coerce.number().int().min(1).max(10),
})

export const professorStudentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
})

export const enrollLearnerSchema = z.object({
  userId: z.string().uuid(),
})

export const lessonProgressParamsSchema = z.object({
  enrollmentId: z.string().uuid(),
  lessonId: z.string().uuid(),
})

export const lessonProgressSchema = z.object({
  progress: z.number().int().min(0).max(100),
})

export type EnrollLearnerInput = z.infer<typeof enrollLearnerSchema>
export type LessonProgressInput = z.infer<typeof lessonProgressSchema>
export type ProfessorStudentsQuery = z.infer<typeof professorStudentsQuerySchema>
