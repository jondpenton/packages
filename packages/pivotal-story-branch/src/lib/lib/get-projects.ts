import axios from 'axios'

export interface Project {
  id: number
  name: string
}

export async function getProjects({
  token,
}: Record<'token', string>): Promise<Project[]> {
  const response = await axios.get<Project[]>(
    'https://www.pivotaltracker.com/services/v5/projects',
    {
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'X-TrackerToken': token,
      },
    },
  )

  return response.data
}
