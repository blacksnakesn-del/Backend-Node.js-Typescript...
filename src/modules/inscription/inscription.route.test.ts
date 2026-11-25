import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from '../../app.js'

describe('routes des inscriptions', () => {
  it('monte les routes documentées sous /api et exige un jeton', async () => {
    const courseId = '11111111-1111-4111-8111-111111111111'
    const enrollmentId = '22222222-2222-4222-8222-222222222222'
    const lessonId = '33333333-3333-4333-8333-333333333333'

    const responses = await Promise.all([
      request(app).post(`/api/courses/${courseId}/enroll`),
      request(app).get(`/api/courses/${courseId}/enrollments`),
      request(app).post(`/api/courses/${courseId}/enrollments`),
      request(app).get('/api/enrollments/me'),
      request(app).get(`/api/students/proffesseur/${courseId}`),
      request(app).put(`/api/enrollments/${enrollmentId}/lessons/${lessonId}/progress`),
      request(app).get('/api/learners/top/3'),
    ])

    for (const response of responses) {
      expect(response.status).toBe(401)
      expect(response.body.error.code).toBe('UNAUTHORIZED')
    }
  })
})
