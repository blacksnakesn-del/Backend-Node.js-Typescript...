import express from 'express'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { sendSuccess } from './api-response.js'

describe('sendSuccess', () => {
  it('inclut les métadonnées fournies dans la réponse', async () => {
    const app = express()
    app.get('/', (_request, response) =>
      sendSuccess(response, [], 200, { utilisateur: { id: 'user-id' } }),
    )

    const response = await request(app).get('/').expect(200)

    expect(response.body.meta).toEqual({ utilisateur: { id: 'user-id' } })
  })
})
