const { server } = require('./src/mocks/server')

let originalToken = process.env.PIVOTAL_TRACKER_TOKEN

// Establish API mocking before all tests.
beforeAll(() => server.listen())

beforeEach(() => {
  process.env.PIVOTAL_TRACKER_TOKEN = undefined
})

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers())

afterAll(() => {
  // Clean up after the tests are finished.
  server.close()

  process.env.PIVOTAL_TRACKER_TOKEN = originalToken
})
