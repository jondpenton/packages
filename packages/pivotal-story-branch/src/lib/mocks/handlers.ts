import { rest } from 'msw'
import { IProject } from '../lib/get-projects'
import { IStory } from '../lib/get-story'

export const handlers = [
  rest.get(
    'https://www.pivotaltracker.com/services/v5/projects',
    (_req, res, ctx) =>
      res(
        ctx.json([
          {
            id: 123,
            name: 'Some project',
          },
        ] as IProject[]),
      ),
  ),
  rest.get(
    'https://www.pivotaltracker.com/services/v5/projects/123/stories/:storyId',
    (req, res, ctx) => {
      if (req.params['storyId'] === `12345678`) {
        return res(
          ctx.json({
            id: 12345678,
            name: 'Story name',
            story_type: 'feature',
          } as IStory),
        )
      }

      return res(ctx.status(400))
    },
  ),
]
