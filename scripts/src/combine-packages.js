const fs = require('fs/promises')
const path = require('path')
const stripJsonComments = require('strip-json-comments')

async function main() {
  const rushConfigText = await fs.readFile(
    path.resolve(__dirname, `../../rush.json`),
    { encoding: `utf-8` }
  )
  const rushConfig = JSON.parse(stripJsonComments(rushConfigText))

  let devDependencies = {}

  for (const project of rushConfig.projects) {
    const packageJsonText = await fs.readFile(
      path.resolve(__dirname, `../../`, project.projectFolder, `package.json`),
      {
        encoding: `utf-8`,
      }
    )
    let packageJson

    try {
      packageJson = JSON.parse(packageJsonText)
    } catch (err) {
      continue
    }

    devDependencies = {
      ...devDependencies,
      ...packageJson.devDependencies,
    }
  }

  console.log(JSON.stringify(devDependencies, null, 2))
}

main()
