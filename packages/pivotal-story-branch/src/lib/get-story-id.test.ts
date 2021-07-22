import { getStoryId } from './get-story-id'

it.each([
  'https://www.pivotaltracker.com/story/show/12345678',
  'http://www.pivotaltracker.com/story/show/12345678',
])('%s', (link) => {
  const expected = '12345678'
  const actual = getStoryId(link)

  expect(actual).toBe(expected)
})

it('throws an error if link is invalid', () => {
  const link = 'https://something.else'

  expect(() => getStoryId(link)).toThrow()
})
