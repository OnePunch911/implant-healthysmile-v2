import { test, expect } from '@playwright/test'

test.describe('API Endpoints', () => {
  test('POST /api/lead - valid submission returns 200', async ({ request }) => {
    const response = await request.post('/api/lead', {
      data: {
        name: '테스트유저',
        phone: '010-1234-5678',
        consent: true
      }
    })

    expect(response.status()).toBe(200)
    const data = await response.json()
    expect(data.ok).toBe(true)

    if (data.id) {
      // If database is connected, expect ID
      expect(data.id).toBeDefined()
      expect(data.created_at).toBeDefined()
    }
  })

  test('POST /api/lead - invalid name returns 400', async ({ request }) => {
    const response = await request.post('/api/lead', {
      data: {
        name: '', // Invalid: empty name
        phone: '010-1234-5678',
        consent: true
      }
    })

    expect(response.status()).toBe(400)
    const data = await response.json()
    expect(data.ok).toBe(false)
    expect(data.code).toBe('invalid_name')
  })

  test('POST /api/lead - invalid phone returns 400', async ({ request }) => {
    const response = await request.post('/api/lead', {
      data: {
        name: '테스트유저',
        phone: '123-456', // Invalid: wrong format
        consent: true
      }
    })

    expect(response.status()).toBe(400)
    const data = await response.json()
    expect(data.ok).toBe(false)
    expect(data.code).toBe('invalid_phone')
  })

  test('POST /api/lead - missing consent returns 400', async ({ request }) => {
    const response = await request.post('/api/lead', {
      data: {
        name: '테스트유저',
        phone: '010-1234-5678',
        consent: false // Invalid: consent required
      }
    })

    expect(response.status()).toBe(400)
    const data = await response.json()
    expect(data.ok).toBe(false)
    expect(data.code).toBe('consent_required')
  })

  test('POST /api/lead - wrong method returns 405', async ({ request }) => {
    const response = await request.get('/api/lead')

    expect(response.status()).toBe(405)
    const data = await response.json()
    expect(data.ok).toBe(false)
    expect(data.code).toBe('method_not_allowed')
  })

  test('GET /api/export-mail - returns 200 or proper error', async ({ request }) => {
    const response = await request.get('/api/export-mail')

    // Should return 200 if all env vars are set, or 503 if missing
    if (response.status() === 200) {
      const data = await response.json()
      expect(data.ok).toBe(true)
      expect(data.count).toBeDefined()
      expect(typeof data.count).toBe('number')
    } else if (response.status() === 503) {
      const data = await response.json()
      expect(data.ok).toBe(false)
      expect(data.code).toBe('env_missing')
    } else {
      // Any other error should still be JSON
      const data = await response.json()
      expect(data.ok).toBe(false)
      expect(data.code).toBeDefined()
    }
  })

  test('GET /api/export-mail - wrong method returns 405', async ({ request }) => {
    const response = await request.post('/api/export-mail', {
      data: {}
    })

    expect(response.status()).toBe(405)
    const data = await response.json()
    expect(data.ok).toBe(false)
    expect(data.code).toBe('method_not_allowed')
  })

  test('API responses have correct content-type', async ({ request }) => {
    const leadResponse = await request.post('/api/lead', {
      data: {
        name: '테스트유저',
        phone: '010-1234-5678',
        consent: true
      }
    })

    const contentType = leadResponse.headers()['content-type']
    expect(contentType).toContain('application/json')

    const exportResponse = await request.get('/api/export-mail')
    const exportContentType = exportResponse.headers()['content-type']
    expect(exportContentType).toContain('application/json')
  })
})