import { exec } from 'child_process'
import { Ora } from 'ora'
import {
  assign,
  createMachine,
  DoneInvokeEvent,
  TransitionConfig,
} from 'xstate'
import { runGenerate } from '../commands/generate'

enum SwitchState {
  Initial = 'INITIAL',
  GenerateBranch = 'GENERATE_BRANCH',
  VerifyBranch = 'VERIFY_BRANCH',
  CheckoutBranch = 'CHECKOUT_BRANCH',
  CreateBranch = 'CREATE_BRANCH',
  PullChanges = 'PULL_CHANGES',
  VerifyRemoteBranch = 'VERIFY_REMOTE_BRANCH',
  CheckoutBaseBranch = 'CHECKOUT_BASE_BRANCH',
  Final = 'FINAL',
}

interface SwitchContext {
  [key: string]: unknown
  branch?: string
  spinner: Ora
  storyId?: string
  token: string
  baseBranch?: string
}

async function branchExists(ctx: SwitchContext): Promise<boolean> {
  ctx.spinner.start(`Checking if branch ${ctx.branch} exists...`)

  const output = await new Promise<string>((resolve, reject) => {
    exec(`git fetch && git branch --list ${ctx.branch}`, (err, stdout) => {
      if (err) {
        ctx.spinner.fail(`Failed to check branch ${ctx.branch}`)
        reject(err)
        return
      }

      resolve(stdout)
    })
  })
  const isLocal = !!output

  if (!isLocal) {
    const isRemote = await remoteBranchExists(ctx, true)

    if (isRemote) {
      return true
    }

    ctx.spinner.info(`Branch ${ctx.branch} doesn't exist`)
  }

  return isLocal
}

async function checkoutBranch(ctx: SwitchContext): Promise<void> {
  ctx.spinner.succeed(`Found branch ${ctx.branch}`)
  ctx.spinner.start(`Switching to branch ${ctx.branch}...`)

  await new Promise<void>((resolve, reject) => {
    exec(`git checkout ${ctx.branch}`, (err) => {
      if (err) {
        ctx.spinner.fail(`Failed to switch to branch ${ctx.branch}`)
        reject(err)
        return
      }

      ctx.spinner.succeed(`Switched to branch ${ctx.branch}`)
      resolve()
    })
  })
}

async function createBranch(ctx: SwitchContext): Promise<void> {
  ctx.spinner.start(`Creating branch ${ctx.branch}...`)

  await new Promise<void>((resolve, reject) => {
    exec(`git pull && git checkout -b ${ctx.branch}`, (err) => {
      if (err) {
        ctx.spinner.fail(`Failed to create branch ${ctx.branch}`)
        reject(err)
        return
      }

      ctx.spinner.succeed(`Created branch ${ctx.branch}`)
      resolve()
    })
  })
}

async function remoteBranchExists(
  ctx: SwitchContext,
  silent = false,
): Promise<boolean> {
  ctx.spinner.start(`Checking if remote branch ${ctx.branch} exists`)

  const output = await new Promise<string>((resolve, reject) => {
    exec(`git branch --list --remote origin/${ctx.branch}`, (err, stdout) => {
      if (err) {
        ctx.spinner.fail(`Failed to check remote branch ${ctx.branch}`)
        reject(err)
        return
      }

      resolve(stdout.trim())
    })
  })

  const isRemote = output.length > 0

  if (!silent) {
    if (isRemote) {
      ctx.spinner.succeed(`Found remote branch ${ctx.branch}`)
    } else {
      ctx.spinner.info(
        `Unable to find remote branch ${ctx.branch}. Not pulling any changes`,
      )
    }
  }

  return isRemote
}

async function pullChanges(ctx: SwitchContext): Promise<void> {
  ctx.spinner.start(`Pulling changes from branch ${ctx.branch}`)

  await new Promise<void>((resolve, reject) => {
    exec(`git pull`, (err) => {
      if (err) {
        ctx.spinner.fail(`Failed to pull changes from branch ${ctx.branch}`)
        reject(err)
        return
      }

      ctx.spinner.succeed(
        `Pulled changes from branch ${ctx.branch} successfully`,
      )
      resolve()
    })
  })
}

async function checkoutBaseBranch(ctx: SwitchContext): Promise<void> {
  ctx.spinner.start(`Switching to base branch ${ctx.baseBranch}...`)

  await new Promise<void>((resolve, reject) => {
    exec(`git checkout ${ctx.baseBranch} && git pull`, (err) => {
      if (err) {
        ctx.spinner.fail(`Failed to switch to base branch ${ctx.baseBranch}`)
        reject(err)
        return
      }

      ctx.spinner.succeed(`Switched to base branch ${ctx.baseBranch}`)
      resolve()
    })
  })
}

const isTruthy = (_ctx: SwitchContext, event: DoneInvokeEvent<unknown>) =>
  !!event.data
const inContext = (key: string) => (ctx: SwitchContext) => !!ctx[key]

const switchMachine = createMachine<SwitchContext>({
  id: 'switch',
  initial: SwitchState.Initial,
  states: {
    [SwitchState.Initial]: {
      always: [
        {
          cond: inContext('branch'),
          target: SwitchState.VerifyBranch,
        },
        {
          cond: inContext('storyId'),
          target: SwitchState.GenerateBranch,
        },
        {
          target: SwitchState.Final,
          actions: [
            (ctx) => ctx.spinner.fail('Failed to find branch or story id'),
          ],
        },
      ],
    },
    [SwitchState.GenerateBranch]: {
      invoke: {
        id: 'getBranch',
        async src(ctx) {
          if (!ctx.storyId) {
            const message = `No story ID found`

            ctx.spinner.fail(message)

            throw new Error(message)
          }

          return runGenerate({
            spinner: ctx.spinner,
            token: ctx.token,
            storyId: ctx.storyId,
          })
        },
        onDone: {
          actions: [assign({ branch: (_ctx, event) => event.data })],
          target: SwitchState.VerifyBranch,
        } as TransitionConfig<SwitchContext, DoneInvokeEvent<string>>,
        onError: {
          target: SwitchState.Final,
        },
      },
    },
    [SwitchState.VerifyBranch]: {
      invoke: {
        id: 'verifyBranch',
        src: branchExists,
        onDone: [
          {
            cond: isTruthy,
            target: SwitchState.CheckoutBranch,
          },
          {
            cond: inContext('baseBranch'),
            target: SwitchState.CheckoutBaseBranch,
          },
          {
            target: SwitchState.CreateBranch,
          },
        ] as TransitionConfig<SwitchContext, DoneInvokeEvent<boolean>>[],
        onError: {
          target: SwitchState.Final,
        },
      },
    },
    [SwitchState.CheckoutBranch]: {
      invoke: {
        id: 'checkoutBranch',
        src: checkoutBranch,
        onDone: {
          target: SwitchState.VerifyRemoteBranch,
        },
        onError: {
          target: SwitchState.Final,
        },
      },
    },
    [SwitchState.VerifyRemoteBranch]: {
      invoke: {
        id: 'verifyRemoteBranch',
        src: (ctx) => remoteBranchExists(ctx),
        onDone: [
          {
            cond: isTruthy,
            target: SwitchState.PullChanges,
          },
          {
            target: SwitchState.Final,
          },
        ] as TransitionConfig<SwitchContext, DoneInvokeEvent<boolean>>[],
      },
    },
    [SwitchState.PullChanges]: {
      invoke: {
        id: 'pullChanges',
        src: pullChanges,
        onDone: {
          target: SwitchState.Final,
        },
        onError: {
          target: SwitchState.Final,
        },
      },
    },
    [SwitchState.CheckoutBaseBranch]: {
      invoke: {
        id: 'checkoutBaseBranch',
        src: checkoutBaseBranch,
        onDone: {
          target: SwitchState.CreateBranch,
        },
        onError: {
          target: SwitchState.Final,
        },
      },
    },
    [SwitchState.CreateBranch]: {
      invoke: {
        id: 'createBranch',
        src: createBranch,
        onDone: {
          target: SwitchState.Final,
        },
        onError: {
          target: SwitchState.Final,
        },
      },
    },
    [SwitchState.Final]: {
      type: 'final',
    },
  },
})

export { switchMachine }
