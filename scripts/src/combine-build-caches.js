const fs = require('fs/promises')
const path = require('path')
const stripJsonComments = require('strip-json-comments')

async function main() {
  const rushConfigText = await fs.readFile(
    path.resolve(__dirname, `../../rush.json`),
    { encoding: `utf-8` }
  )
  const rushConfig = JSON.parse(stripJsonComments(rushConfigText))

  let buildCaches = {}

  for (const project of rushConfig.projects) {
    try {
      const buildCacheText = await fs.readFile(
        path.resolve(
          __dirname,
          `../../`,
          project.projectFolder,
          `.rush/temp/package-deps_build.json`
        ),
        {
          encoding: `utf-8`,
        }
      )

      const buildCache = JSON.parse(buildCacheText)

      buildCaches = {
        ...buildCaches,
        [project.packageName]: buildCache,
      }
    } catch (err) {
      continue
    }
  }

  console.log(JSON.stringify(buildCaches, null, 2))
}

main()
