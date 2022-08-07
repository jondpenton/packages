import { test } from '@oclif/test'
import { promises as fs } from 'fs'

test
  .stub(
    fs,
    'readdir',
    jest.fn(() => Promise.resolve())
  )
  .stub(
    fs,
    'readFile',
    jest.fn(() =>
      Promise.resolve(
        JSON.stringify({
          myKey: 'myValue',
        })
      )
    )
  )
  .stub(
    fs,
    'writeFile',
    jest.fn(() => Promise.resolve())
  )
  .stdout()
  .command(['config:remove', 'myKey'])
  .it(`deletes 'myKey' from configuration`, () => {
    const [, passedConfig] = (fs.writeFile as jest.Mock).mock.calls[0]

    expect(passedConfig).toBe(JSON.stringify({}))
  })

test
  .stderr()
  .command(['config:remove'])
  .catch((err) => {
    expect(
      (err as Error).message.startsWith(`Missing 1 required arg:
key`)
    ).toBeTruthy()
  })
  .it(`throws error if key is not provided`)
