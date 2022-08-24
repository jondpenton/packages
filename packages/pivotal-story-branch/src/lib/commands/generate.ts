import Ora from 'ora'
import { Command } from '../lib/command'
import { formatBranch } from '../lib/format-branch'
import { getStory } from '../lib/get-story'
import { getStoryId } from '../lib/get-story-id'

class Generate extends Command {
  private spinner: Ora.Ora

  static override description =
    'generates a branch name for a Pivotal Tracker story'

  static override aliases = ['gen']

  static override args = [
    {
      name: 'story_link',

      description: 'Link to Pivotal Tracker story',

      // eslint-disable-next-line require-await
      parse: async (input: string) => getStoryId(input),
      required: true,
    },
  ]

  constructor(...args: ConstructorParameters<typeof Command>) {
    super(...args)

    this.spinner = Ora()
  }

  async run() {
    const { args } = await this.parse(Generate)
    const { token } = await this.getConfig()

    if (!token) {
      throw new Error(
        `\`token\` is required in configuration. Set one using the 'config:set' command`,
      )
    }

    const branch = await runGenerate({
      spinner: this.spinner,
      storyId: args['story_link'],
      token,
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
  spinner?.start('Fetching story...')

  const story = await getStory({
    storyId,
    token,
  })

  spinner?.succeed('Fetched story')

  const branch = formatBranch(story)

  return branch
}

export default Generate
export { runGenerate }
