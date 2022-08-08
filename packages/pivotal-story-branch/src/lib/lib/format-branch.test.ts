import { IStory } from './get-story'
import { formatBranch } from './format-branch'

it('formats a short story correctly', () => {
  const story: IStory = {
    id: 1,
    name: 'some name',
    story_type: 'feature',
  }

  const branchName = formatBranch(story)

  expect(branchName).toBe('feature/some-name-#1')
})

it('formats a long story correctly', () => {
  const story: IStory = {
    id: 1,
    name: "this is an extremely, long, precarious name and should be shortened but won't",
    story_type: 'feature',
  }

  const branchName = formatBranch(story)

  expect(branchName).toBe('feature/this-is-an-extremely-long-precarious-#1')
})

it('returns a longer formatted branch name when PIVOTAL_TRACKER_BRANCH_MAX_LENGTH is set', () => {
  const originalMaxLength = process.env['PIVOTAL_TRACKER_BRANCH_MAX_LENGTH']

  try {
    process.env['PIVOTAL_TRACKER_BRANCH_MAX_LENGTH'] = '60'
    const story: IStory = {
      id: 1,
      name: "this is an extremely, long, precarious name and should be shortened but won't",
      story_type: 'feature',
    }

    const branchName = formatBranch(story)

    expect(branchName).toBe(
      'feature/this-is-an-extremely-long-precarious-name-and-#1',
    )
  } catch (err) {
    process.env['PIVOTAL_TRACKER_BRANCH_MAX_LENGTH'] = originalMaxLength

    throw err
  }
})
