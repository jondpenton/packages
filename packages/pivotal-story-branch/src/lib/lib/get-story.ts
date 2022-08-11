import axios from 'axios'

export interface IStory {
  id: number
  name: string
  story_type: 'feature' | 'bug' | 'chore' | 'release'
}

export async function getStory({
  storyId,
  token,
}: {
  storyId: string
  token: string
}): Promise<IStory> {
  try {
    const response = await axios.get<IStory>(
      `https://www.pivotaltracker.com/services/v5/stories/${storyId}`,
      {
        headers: {
          'X-TrackerToken': token,
        },
      },
    )
    return response.data
  } catch (err) {
    throw new Error('Unable to find story')
  }
}
