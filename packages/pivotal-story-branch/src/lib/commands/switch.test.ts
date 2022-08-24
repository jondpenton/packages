import childProcess from 'child_process'
import { test } from '@oclif/test'
import { promises as fs } from 'fs'

const callbackMock = jest
  .fn()
  .mockReturnValueOnce([new Error()])
  .mockReturnValueOnce([])
  .mockReturnValueOnce([])

test
  .skip()
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
    childProcess,
    'exec',
    jest.fn<void, unknown[]>((_command, cb) => {
      const results = callbackMock()

      if (typeof cb === `function`) {
        cb(...results)
      }
    }),
  )
  .stderr()
  .command(['switch', 'https://www.pivotaltracker.com/story/show/12345678'])
  .it(`switches to branch that doesn't exist`, () => {
    const branchName = 'feature/story-name-#12345678'
    const exec = childProcess.exec as unknown as jest.Mock

    expect(exec).toHaveBeenCalledTimes(
      // eslint-disable-next-line no-magic-numbers
      2,
    )
    expect(exec.mock.calls[0][0]).toBe(`git checkout ${branchName}`)
    expect(exec.mock.calls[1][0]).toBe(`git checkout -b ${branchName}`)
  })

test
  .skip()
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
    childProcess,
    'exec',
    jest.fn<void, unknown[]>((_command, cb) => {
      const results = callbackMock()

      if (typeof cb === `function`) {
        cb(...results)
      }
    }),
  )
  .stderr()
  .command(['switch', 'https://www.pivotaltracker.com/story/show/12345678'])
  .it(`switches to branch that doesn't exist`, () => {
    const branchName = 'feature/story-name-#12345678'
    const exec = childProcess.exec as unknown as jest.Mock

    expect(exec).toHaveBeenCalledTimes(
      // eslint-disable-next-line no-magic-numbers
      1,
    )
    expect(exec.mock.calls[0][0]).toBe(`git checkout ${branchName}`)
  })

test
  .stderr()
  .command(['switch'])
  .catch((err) => {
    expect((err as Error).message).toMatch(
      /^Missing 1 required arg:\s+branch_or_story_link/u,
    )
  })
  .it(`throws error if branch or story link not provided`)
