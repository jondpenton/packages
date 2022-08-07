import { IProject } from './get-projects'
import axios from 'axios'

export interface IStory {
  id: number
  name: string
  story_type: 'feature' | 'bug' | 'chore' | 'release'
}

export async function getStory({
  projects,
  storyId,
  token,
}: {
  projects: IProject[]
  storyId: string
  token: string
}): Promise<IStory> {
  for (const project of projects) {
    try {
      const response = await axios.get<IStory>(
        `https://www.pivotaltracker.com/services/v5/projects/${project.id}/stories/${storyId}`,
        {
          headers: {
            'X-TrackerToken': token,
          },
        },
      )
      return response.data
    } catch (err) {
      continue
    }
  }

  throw new Error('Unable to find story')
}
