import { describe, expect, it } from 'vitest'
import {
  createCoursSchema,
  listerCoursSchema,
  updateCoursPartiellementSchema,
  updateCoursSchema,
} from './cours.schema.js'

describe('course category validation', () => {
  it('accepts only the configured categories when creating a course', () => {
    const baseCourse = {
      description: 'Description du cours',
      proffesseur: '11111111-1111-4111-8111-111111111111',
      capacite: 50,
      lieu: 'Salle A',
    }

    expect(createCoursSchema.safeParse({ ...baseCourse, category: 'data' }).success).toBe(true)
    expect(createCoursSchema.safeParse({ ...baseCourse, category: 'design' }).success).toBe(false)
    expect(createCoursSchema.safeParse({ ...baseCourse, proffesseur: 'Professeur' }).success).toBe(
      false,
    )
  })

  it('allows filtering by category and validates only editable update fields', () => {
    expect(listerCoursSchema.safeParse({ category: 'web' }).success).toBe(true)
    expect(updateCoursSchema.safeParse({ level: 'starter' }).success).toBe(true)
    expect(updateCoursSchema.safeParse({ category: 'web' }).success).toBe(false)
  })

  it('accepts between one and three editable course fields', () => {
    expect(updateCoursPartiellementSchema.safeParse({ title: 'Nouveau titre' }).success).toBe(true)
    expect(
      updateCoursPartiellementSchema.safeParse({
        title: 'Nouveau titre',
        description: 'Description',
        level: 'starter',
      }).success,
    ).toBe(true)
    expect(updateCoursPartiellementSchema.safeParse({}).success).toBe(false)
    expect(
      updateCoursPartiellementSchema.safeParse({
        title: 'Titre',
        description: 'Description',
        summary: 'Résumé',
        level: 'advenced',
      }).success,
    ).toBe(false)
  })

  it('rejects unknown fields and unsupported levels', () => {
    expect(updateCoursPartiellementSchema.safeParse({ published: true }).success).toBe(false)
    expect(updateCoursPartiellementSchema.safeParse({ level: 'advanced' }).success).toBe(false)
    expect(updateCoursPartiellementSchema.safeParse({ description: 'x'.repeat(251) }).success).toBe(
      false,
    )
  })
})
