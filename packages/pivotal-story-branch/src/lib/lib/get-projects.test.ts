import type { Project } from './get-projects'
import { getProjects } from './get-projects'
import { rest, server } from '../mocks/server'

it('fetches projects from Pivotal Tracker API', async () => {
  const projects: Project[] = [
    {
      id: 123,
      name: 'Some project',
    },
    {
      id: 124,
      name: 'Another one',
    },
  ]
  server.use(
    rest.get(
      'https://www.pivotaltracker.com/services/v5/projects',
      (_req, res, ctx) => res(ctx.json(projects)),
    ),
  )

  const fetchedProjects = await getProjects({ token: '' })

  expect(fetchedProjects).toMatchObject(projects)
})
