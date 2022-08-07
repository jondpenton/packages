import * as Parser from '@oclif/parser'
import Ora from 'ora'
import { Command } from '../lib/command'
import { formatBranch } from '../lib/format-branch'
import { getProjects } from '../lib/get-projects'
import { getStory } from '../lib/get-story'
import { getStoryId } from '../lib/get-story-id'

class Generate extends Command {
  private spinner: Ora.Ora

  static override description =
    'generates a branch name for a Pivotal Tracker story'

  static override aliases = ['gen']

  static override args: Parser.args.Input = [
    {
      name: 'story_link',
      description: 'Link to Pivotal Tracker story',
      required: true,
      parse: getStoryId,
    },
  ]

  constructor(...args: ConstructorParameters<typeof Command>) {
    super(...args)

    this.spinner = Ora()
  }

  async run() {
    const { args } = this.parse(Generate)
    const { token } = await this.getConfig()

    if (!token) {
      throw new Error(
        `\`token\` is required in configuration. Set one using the 'config:set' command`,
      )
    }

    const branch = await runGenerate({
      spinner: this.spinner,
      token,
      storyId: args['story_link'],
    })

    this.log(branch)
  }
}

async function runGenerate({
  spinner,
  token,
  storyId,
}: {
  spinner?: Ora.Ora
  token: string
  storyId: string
}): Promise<string> {
  spinner?.start('Fetching projects...')
  const projects = await getProjects({ token })

  spinner?.succeed('Fetched projects')
  spinner?.start('Fetching story...')

  const story = await getStory({ token, projects, storyId })

  spinner?.succeed('Fetched story')

  const branch = formatBranch(story)

  return branch
}

export default Generate
export { runGenerate }
