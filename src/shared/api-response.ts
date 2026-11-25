import type { Request, Response } from 'express'

export function sendSuccess<T>(response: Response, data: T, status = 200, meta?: unknown): Response {
  return response.status(status).json({
    success: true,
    data,
    ...(meta === undefined ? {} : { meta }),
    request_id: response.get('x-request-id'),
  })
}

export function sendError(response: Response, message: string, status = 400, meta?: unknown): Response {
  return response.status(status).json({ success: false, message, request_id: response.get('x-request-id') })
}