import { expect, test } from '@oclif/test'
import { promises as fs } from 'fs'

test
  .stub(fs, 'readdir', () => Promise.resolve())
  .stub(fs, 'readFile', () => Promise.resolve(JSON.stringify({})))
  .stdout()
  .command(['config'])
  .it('shows configuration', (ctx) => {
    expect(ctx.stdout).to.equal(`Configuration:
${JSON.stringify({})}
`)
  })
