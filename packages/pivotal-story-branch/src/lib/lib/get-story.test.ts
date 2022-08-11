import { getStory } from './get-story'

it('gets a story', async () => {
  const storyId = `12345678`

  const fetchedStory = await getStory({
    storyId,
    token: '',
  })

  expect(fetchedStory).toMatchObject({ id: Number(storyId) })
})

it('throws an error if story not found', async () => {
  const storyId = `12345679`

  await expect(getStory({ storyId, token: '' })).rejects.toThrowError(
    'Unable to find story',
  )
})
