import { randomUUID } from 'node:crypto'
import type { RequestHandler } from 'express'

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const requestId: RequestHandler = (request, response, next) => {
  const candidate = request.header('x-request-id')?.trim()
  const generatedByServer = !candidate || !uuidPattern.test(candidate)
  const id = generatedByServer ? randomUUID() : candidate
  request.requestId = id
  response.setHeader('x-request-id', id)
  response.setHeader('x-request-id-generated', String(true))
  next()
}
