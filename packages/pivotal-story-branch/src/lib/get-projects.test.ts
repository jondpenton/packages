import { server, rest } from '../mocks/server'
import { IProject, getProjects } from './get-projects'

it('fetches projects from Pivotal Tracker API', async () => {
  const projects: IProject[] = [
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
      (_req, res, ctx) => res(ctx.json(projects))
    )
  )

  const fetchedProjects = await getProjects({ token: '' })

  expect(fetchedProjects).toMatchObject(projects)
})
