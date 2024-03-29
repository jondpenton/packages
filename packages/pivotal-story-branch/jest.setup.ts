import { server } from './src/lib/mocks/server'

const originalToken = process.env['PIVOTAL_TRACKER_TOKEN']

// Establish API mocking before all tests.
beforeAll(() => server.listen())

beforeEach(() => {
  delete process.env['PIVOTAL_TRACKER_TOKEN']
})

/*
 * Reset any request handlers that we may add during the tests,
 * So they don't affect other tests.
 */
afterEach(() => server.resetHandlers())

afterAll(() => {
  // Clean up after the tests are finished.
  server.close()

  process.env['PIVOTAL_TRACKER_TOKEN'] = originalToken
})
