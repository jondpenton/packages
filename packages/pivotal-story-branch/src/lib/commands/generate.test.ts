import { test } from '@oclif/test'
import { promises as fs } from 'fs'
import util from 'util'

test
  .stub(
    fs,
    'readdir',
    jest.fn(() => Promise.resolve()),
  )
  .stub(
    fs,
    'readFile',
    jest.fn(() =>
      Promise.resolve(
        JSON.stringify({
          token: 'ABC123',
        }),
      ),
    ),
  )
  .stub(
    util,
    'format',
    jest.fn(() => ''),
  )
  .stderr()
  .command(['generate', 'https://www.pivotaltracker.com/story/show/12345678'])
  .it(`generates branch name`, () => {
    expect(util.format).toHaveBeenCalledWith('feature/story-name-#12345678')
  })

test
  .stderr()
  .command(['generate'])
  .catch((err) =>
    expect(
      err.message.startsWith(`Missing 1 required arg:
story_link`),
    ).toBeTruthy(),
  )
  .it(`throws error if story_link is not provided`)
