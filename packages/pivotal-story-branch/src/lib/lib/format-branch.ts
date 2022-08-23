import slugify from 'slugify'
import { DEFAULT_BRANCH_MAX_LENGTH } from './format-branch.constants'
import { IStory } from './get-story'

export function formatBranch(story: IStory): string {
  const characterLimit = process.env['PIVOTAL_TRACKER_BRANCH_MAX_LENGTH']
    ? parseInt(process.env['PIVOTAL_TRACKER_BRANCH_MAX_LENGTH'])
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

  // eslint-disable-next-line no-magic-numbers
  const usedWords: string[] = nameWords.slice(0, 1)

  // eslint-disable-next-line no-magic-numbers
  for (const word of nameWords.slice(1)) {
    if ([...usedWords, word].join('-').length > remainingLength) {
      break
    }

    usedWords.push(word)
  }

  return `${story.story_type}/${usedWords.join('-')}-#${story.id}`
}
