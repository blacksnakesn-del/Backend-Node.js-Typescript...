import { describe, expect, it } from 'vitest'
import {
  enrollLearnerSchema,
  lessonProgressSchema,
  professorStudentsParamsSchema,
  professorStudentsQuerySchema,
  topLearnersParamsSchema,
} from './inscription.schema.js'

describe('validation des inscriptions', () => {
  it('accepte les bornes inclusives de progression', () => {
    expect(lessonProgressSchema.parse({ progress: 0 }).progress).toBe(0)
    expect(lessonProgressSchema.parse({ progress: 100 }).progress).toBe(100)
  })

  it('refuse une progression hors limites ou non entière', () => {
    expect(lessonProgressSchema.safeParse({ progress: -1 }).success).toBe(false)
    expect(lessonProgressSchema.safeParse({ progress: 100.5 }).success).toBe(false)
    expect(lessonProgressSchema.safeParse({ progress: 101 }).success).toBe(false)
  })

  it('exige un UUID pour inscrire un autre apprenant', () => {
    expect(
      enrollLearnerSchema.safeParse({ userId: '22222222-2222-4222-8222-222222222222' }).success,
    ).toBe(true)
    expect(enrollLearnerSchema.safeParse({ userId: '123' }).success).toBe(false)
  })

  it('valide l’identifiant du professeur et la pagination de sa liste d’étudiants', () => {
    expect(
      professorStudentsParamsSchema.safeParse({
        idProffesseur: '22222222-2222-4222-8222-222222222222',
      }).success,
    ).toBe(true)
    expect(professorStudentsParamsSchema.safeParse({ idProffesseur: '123' }).success).toBe(false)
    expect(professorStudentsQuerySchema.parse({})).toEqual({ page: 1, per_page: 20 })
    expect(professorStudentsQuerySchema.safeParse({ page: 0 }).success).toBe(false)
    expect(professorStudentsQuerySchema.safeParse({ per_page: 101 }).success).toBe(false)
  })

  it('accepte uniquement un rang entier compris entre 1 et 10', () => {
    expect(topLearnersParamsSchema.parse({ rang: '1' })).toEqual({ rang: 1 })
    expect(topLearnersParamsSchema.parse({ rang: '10' })).toEqual({ rang: 10 })
    expect(topLearnersParamsSchema.safeParse({ rang: '0' }).success).toBe(false)
    expect(topLearnersParamsSchema.safeParse({ rang: '11' }).success).toBe(false)
    expect(topLearnersParamsSchema.safeParse({ rang: '1.5' }).success).toBe(false)
  })
})
