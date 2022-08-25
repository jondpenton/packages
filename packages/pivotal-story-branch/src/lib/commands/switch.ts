import Ora from 'ora'
import { Flags } from '@oclif/core'
import { interpret } from 'xstate'
import { Command } from '../lib/command'
import { getStoryId } from '../lib/get-story-id'
import { switchMachine } from '../machines/switch-machine'

class Switch extends Command {
  public static override description =
    'switches branch to generated Pivotal Tracker story branch'

  public static override args = [
    {
      name: 'branch_or_story_link',

      description: 'Branch name or link to Pivotal Tracker story',
      required: true,
    },
  ]

  public static override flags = {
    'base-branch': Flags.string({
      char: 'b',
      description: 'Branch used when creating a new branch',
    }),
  }

  public async run() {
    const { args, flags } = await this.parse(Switch)
    const config = await this.getConfig()
    const { token } = config
    let { baseBranch } = config

    if (!token) {
      throw new Error(
        `\`token\` is required in configuration. Set one using the 'config:set' command`,
      )
    }

    if (!baseBranch) {
      baseBranch = flags['base-branch']
    }

    let branch: string | undefined
    let storyId: string | undefined

    try {
      storyId = getStoryId(args['branch_or_story_link'])
    } catch (err) {
      branch = args['branch_or_story_link']
    }

    interpret(
      switchMachine.withContext({
        baseBranch,
        branch,
        spinner: Ora(),
        storyId,
        token,
      }),
    ).start()
  }
}

export default Switch
