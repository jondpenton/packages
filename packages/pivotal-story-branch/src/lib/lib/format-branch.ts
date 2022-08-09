import slugify from 'slugify'
import { IStory } from './get-story'

export function formatBranch(story: IStory): string {
  const characterLimit = process.env['PIVOTAL_TRACKER_BRANCH_MAX_LENGTH']
    ? parseInt(process.env['PIVOTAL_TRACKER_BRANCH_MAX_LENGTH'], 10)
    : 50
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
  const usedWords: string[] = [nameWords[0]]

  for (const word of nameWords.slice(1)) {
    if ([...usedWords, word].join('-').length > remainingLength) {
      break
    }

    usedWords.push(word)
  }

  return `${story.story_type}/${usedWords.join('-')}-#${story.id}`
}
