import path from 'path'
import { Command } from '@oclif/core'
import { promises as fs } from 'fs'

interface IUserConfig {
  [key: string]: string | undefined
  token?: string
}

class SetConfig extends Command {
  static override description = 'Sets a value in the configuration'

  static override args = [
    {
      name: 'key',

      description: 'Key the value is set under in configuration',
      required: true,
    },
    {
      name: 'value',

      description: 'Value that is set under key in configuration',
      required: true,
    },
  ]

  async getConfig() {
    try {
      await fs.readdir(this.config.configDir)
    } catch (err) {
      await fs.mkdir(this.config.configDir, { recursive: true })
    }

    const configPath = this.getConfigPath()
    let userConfig: IUserConfig

    try {
      const rawUserConfig = await fs.readFile(configPath)
      userConfig = JSON.parse(rawUserConfig.toString())
    } catch (err) {
      userConfig = {}
    }

    return userConfig
  }

  getConfigPath() {
    return path.join(this.config.configDir, './config.json')
  }

  async run() {
    const {
      args: { key, value },
    } = await this.parse(SetConfig)
    const config = await this.getConfig()
    config[key] = value

    const configPath = this.getConfigPath()

    await fs.writeFile(configPath, JSON.stringify(config))
  }
}

export default SetConfig
