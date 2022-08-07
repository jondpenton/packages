import { test } from '@oclif/test'
import { promises as fs } from 'fs'

test
  .stub(
    fs,
    'readdir',
    jest.fn(() => Promise.resolve()),
  )
  .stub(
    fs,
    'readFile',
    jest.fn(() => Promise.resolve(JSON.stringify({}))),
  )
  .stub(
    fs,
    'writeFile',
    jest.fn(() => Promise.resolve()),
  )
  .stdout()
  .command(['config:set', 'myKey', 'myValue'])
  .it(`sets 'myKey' in configuration`, () => {
    const [, passedConfig] = (fs.writeFile as jest.Mock).mock.calls[0]

    expect(passedConfig).toBe(
      JSON.stringify({
        myKey: 'myValue',
      }),
    )
  })

test
  .stderr()
  .command(['config:set'])
  .catch((err) => {
    expect(
      /^Missing 2 required args:\s+key.*\s+value/.test((err as Error).message),
    ).toBeTruthy()
  })
  .it(`throws error if key and value is not provided`)

test
  .stderr()
  .command(['config:set', 'myKey'])
  .catch((err) => {
    expect((err as Error).message).toMatch(/^Missing 1 required arg:\s+value/)
  })
  .it(`throws error if value is not provided`)
