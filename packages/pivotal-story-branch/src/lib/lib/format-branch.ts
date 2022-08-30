import slugify from 'slugify'
import { DEFAULT_BRANCH_MAX_LENGTH } from './format-branch.constants'
import type { Story } from './get-story'

export function formatBranch(story: Story): string {
  const characterLimit = process.env['PIVOTAL_TRACKER_BRANCH_MAX_LENGTH']
    ? Number(process.env['PIVOTAL_TRACKER_BRANCH_MAX_LENGTH'])
    : DEFAULT_BRANCH_MAX_LENGTH
  const baseLength = `${story.story_type}/`.length + `-#${story.id}`.length
  const remainingLength = characterLimit - baseLength
  const nameSlug = slugify(story.name.trim(), {
    lower: true,
    strict: true,
  })

  if (nameSlug.length <= remainingLength) {
    return `${story.story_type}/${nameSlug}-#${story.id}`
  }

  const nameWords = nameSlug.split('-')

  const usedWords: string[] = nameWords.slice(
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    0,

    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    1,
  )

  for (const word of nameWords.slice(
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    1,
  )) {
    if ([...usedWords, word].join('-').length > remainingLength) {
      break
    }

    usedWords.push(word)
  }

  return `${story.story_type}/${usedWords.join('-')}-#${story.id}`
}
