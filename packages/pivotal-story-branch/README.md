# Pivotal Tracker Story Branch Generator

[Pivotal Tracker Story Branch Generator](https://yarnpkg.com/package/pivotal-story-branch) is a tool to automatically generate a branch name for a new story in [Pivotal Tracker](https://www.pivotaltracker.com/).

## Installation

Installing this package will install a binary `psb`.

```bash
# NPM
npm install --global pivotal-story-branch

# Yarn
yarn global add pivotal-story-branch
```

## Setup

You will need to grab the API token from [your profile](https://www.pivotaltracker.com/profile) and set it to the environment variable `PIVOTAL_TRACKER_TOKEN`.

## Commands

Copy the link of your story use it like so:

```bash
Pivotal Tracker Story Branch Generator is a tool to automatically generate a branch name for a new story in Pivotal Tracker.

USAGE
  $ psb [COMMAND]

TOPICS
  config  reads the configuration

COMMANDS
  config    reads the configuration
  generate  generates a branch name for a Pivotal Tracker story
  help      display help for psb
  switch    switches branch to generated Pivotal Tracker story branch
```

### psb config

```bash
reads the configuration

USAGE
  $ psb config

COMMANDS
  config:remove  Removes a key from the configuration
  config:set     Sets a value in the configuration
```

#### Example

```bash
$ psb config
Configuration:
{
  "token": "104e73e8-6196-4202-a8de-80de34b14f03"
}
```

### psb config:remove

```bash
Removes a key from the configuration

USAGE
  $ psb config:remove KEY

ARGUMENTS
  KEY  Key to remove from configuration
```

#### Example

```bash
$ psb config:remove token

$ psb config
Configuration:
{}
```

### psb config:set

```bash
Sets a value in the configuration

USAGE
  $ psb config:set KEY VALUE

ARGUMENTS
  KEY    Key the value is set under in configuration
  VALUE  Value that is set under key in configuration
```

#### Example

```bash
$ psb config:set token abc

$ psb config
Configuration:
{
  "token": "abc"
}
```

### psb generate

```bash
generates a branch name for a Pivotal Tracker story

USAGE
  $ psb generate STORY_LINK

ARGUMENTS
  STORY_LINK  Link to Pivotal Tracker story

ALIASES
  $ psb gen
```

#### Example

```bash
$ psb generate https://www.pivotaltracker.com/story/show/12345678
✔ Fetched projects
✔ Fetched story
feature/story-name-#12345678
```

### psb switch

```bash
switches branch to generated Pivotal Tracker story branch

USAGE
  $ psb switch BRANCH_OR_STORY_LINK

ARGUMENTS
  BRANCH_OR_STORY_LINK  Branch name or link to Pivotal Tracker story

OPTIONS
  -b, --base-branch=base-branch  Branch used when creating a new branch
```

#### Example

```bash
$ psb switch https://www.pivotaltracker.com/story/show/12345678
✔ Fetched projects
✔ Fetched story
ℹ Branch feature/story-name-#12345678 doesn't exist.
✔ Created branch feature/story-name-#12345678
```

### Additional Info

The statuses shown by the tool are sent to stderr, while only the branch name is sent to stdout. This means you can use this tool in combination with other commands like:

```bash
# Copy to clipboard
$ psb gen https://www.pivotaltracker.com/story/show/12345678 | pbcopy
```

## Configuration

### Environment variables

#### `PIVOTAL_TRACKER_TOKEN`

This will need to reflect the token on your profile page, as seen in the [setup](#setup) section.

#### `PIVOTAL_TRACKER_BRANCH_MAX_LENGTH`

This length is used by the tool to determine how long the branch name should be. It uses a default value of 50.
