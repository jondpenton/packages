import path from 'path'
import { Command } from '@oclif/core'
import { promises as fs } from 'fs'

interface UserConfig {
  [key: string]: string | undefined
  token?: string
}

abstract class CommandWithHelpers extends Command {
  public async getConfig() {
    try {
      await fs.readdir(this.config.configDir)
    } catch (err) {
      await fs.mkdir(this.config.configDir, { recursive: true })
    }

    const configPath = this.getConfigPath()
    let userConfig: UserConfig

    try {
      const rawUserConfig = await fs.readFile(configPath)
      userConfig = JSON.parse(rawUserConfig.toString())
    } catch (err) {
      userConfig = {}
    }

    return userConfig
  }

  public getConfigPath() {
    return path.join(this.config.configDir, './config.json')
  }
}

export { CommandWithHelpers as Command }
