import { Command } from '../../lib/command'

class Config extends Command {
  static description = 'reads the configuration'

  async run() {
    const config = await this.getConfig()

    this.log('Configuration:')
    this.log(JSON.stringify(config, null, 2))
  }
}

export default Config
