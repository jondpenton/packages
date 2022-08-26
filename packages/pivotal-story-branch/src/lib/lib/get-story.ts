import axios from 'axios'

export interface Story {
  id: number
  name: string

  // eslint-disable-next-line @typescript-eslint/naming-convention
  story_type: 'feature' | 'bug' | 'chore' | 'release'
}

export async function getStory({
  storyId,
  token,
}: {
  storyId: string
  token: string
}): Promise<Story> {
  try {
    const response = await axios.get<Story>(
      `https://www.pivotaltracker.com/services/v5/stories/${storyId}`,
      {
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'X-TrackerToken': token,
        },
      },
    )
    return response.data
  } catch (err) {
    throw new Error('Unable to find story')
  }
}
