import { Command } from '../../lib/command'

class Config extends Command {
  public static override description = 'reads the configuration'

  public async run() {
    const config = await this.getConfig()

    this.log('Configuration:')

    this.log(
      JSON.stringify(
        config,
        null,

        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        2,
      ),
    )
  }
}

export default Config
