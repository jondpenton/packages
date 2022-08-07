import * as Parser from '@oclif/parser'
import { promises as fs } from 'fs'
import { Command } from '../../lib/command'

class RemoveConfig extends Command {
  static override description = 'Removes a key from the configuration'

  static override args: Parser.args.Input = [
    {
      name: 'key',
      required: true,
      description: 'Key to remove from configuration',
    },
  ]

  async run() {
    const {
      args: { key },
    } = this.parse(RemoveConfig)
    const config = await this.getConfig()
    delete config[key]
    const configPath = this.getConfigPath()

    await fs.writeFile(configPath, JSON.stringify(config))
  }
}

export default RemoveConfig
