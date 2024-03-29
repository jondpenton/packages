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
    const [[, passedConfig]] = (fs.writeFile as jest.Mock).mock.calls

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
    expect(err.message).toMatch(/^Missing 2 required args:\s+key.*\s+value/u)
  })
  .it(`throws error if key and value is not provided`)

test
  .stderr()
  .command(['config:set', 'myKey'])
  .catch((err) => {
    expect(err.message).toMatch(/^Missing 1 required arg:\s+value/u)
  })
  .it(`throws error if value is not provided`)
