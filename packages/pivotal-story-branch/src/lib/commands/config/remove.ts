import { promises as fs } from 'fs'
import { Command } from '../../lib/command'

class RemoveConfig extends Command {
  static override description = 'Removes a key from the configuration'

  static override args = [
    {
      name: 'key',

      description: 'Key to remove from configuration',
      required: true,
    },
  ]

  async run() {
    const {
      args: { key },
    } = await this.parse(RemoveConfig)
    const config = await this.getConfig()
    delete config[key]
    const configPath = this.getConfigPath()

    await fs.writeFile(configPath, JSON.stringify(config))
  }
}

export default RemoveConfig
