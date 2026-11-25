import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from '../../app.js'

describe('modification partielle des cours', () => {
  it.each([
    '/api/test/courses/11111111-1111-4111-8111-111111111111',
    '/api/courses/11111111-1111-4111-8111-111111111111',
  ])('exige une authentification sur %s', async (path) => {
    const response = await request(app)
      .patch(path)
      .send({ title: 'Nouveau titre' })
      .expect(401)

    expect(response.body.error.code).toBe('UNAUTHORIZED')
  })

  it('exige un enseignant ou un administrateur pour créer un cours', async () => {
    const response = await request(app)
      .post('/api/courses')
      .send({
        name: 'Cours',
        description: 'Description',
        proffesseur: '11111111-1111-4111-8111-111111111111',
        capacite: 50,
        lieu: 'Salle A',
      })
      .expect(401)

    expect(response.body.error.code).toBe('UNAUTHORIZED')
  })
})
