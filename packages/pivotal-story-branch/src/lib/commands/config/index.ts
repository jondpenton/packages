import { Command } from '../../lib/command'

class Config extends Command {
  static override description = 'reads the configuration'

  async run() {
    const config = await this.getConfig()

    this.log('Configuration:')

    this.log(
      JSON.stringify(
        config,
        null,

        // eslint-disable-next-line no-magic-numbers
        2,
      ),
    )
  }
}

export default Config
