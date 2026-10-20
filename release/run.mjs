import { execFileSync } from 'node:child_process'
import { appendFileSync } from 'node:fs'
import { automaticBump, planRelease, resolveOptions, stableTags } from './policy.mjs'
import { publishRelease } from './publish.mjs'
import { releaseLabels } from './labels.mjs'
import semver from 'semver'

const env = process.env
const repository = env.GITHUB_REPOSITORY
const sha = env.GITHUB_SHA
const branch = env.RELEASE_BRANCH || 'main'
const dryRun = env.RELEASE_DRY_RUN === 'true'
if (!/^[\w.-]+\/[\w.-]+$/.test(repository || '')) throw new Error('Dépôt GitHub invalide.')
if (!/^[a-f0-9]{40,64}$/.test(sha || '')) throw new Error('SHA de publication invalide.')
if (!env.GITHUB_TOKEN) throw new Error('GITHUB_TOKEN est requis.')
if (env.GITHUB_REF !== `refs/heads/${branch}`) throw new Error(`Les versions ne sont publiées que depuis ${branch}.`)
if (!['push', 'workflow_dispatch'].includes(env.GITHUB_EVENT_NAME)) throw new Error('Événement non autorisé pour une publication.')
const git = (...args) => execFileSync('git', args, { cwd: env.GITHUB_WORKSPACE, encoding: 'utf8' }).trim()
if (git('rev-parse', 'HEAD') !== sha) throw new Error('Le checkout ne correspond pas au commit validé par la CI.')
git('fetch', '--tags', 'origin')

async function api(method, path, body, allow404 = false) {
  const response = await fetch(`https://api.github.com/repos/${repository}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(30000),
  })
  if (allow404 && response.status === 404) return null
  if (!response.ok) throw new Error(`GitHub ${method} ${path}: ${response.status} ${(await response.json()).message || ''}`)
  return response.status === 204 ? null : response.json()
}
async function pages(path) {
  const result = []
  for (let page = 1; ; page++) {
    const entries = await api('GET', `${path}?per_page=100&page=${page}`)
    result.push(...entries)
    if (entries.length < 100) return result
  }
}
function output(result) {
  console.log(JSON.stringify(result, null, 2))
  if (env.GITHUB_OUTPUT) {
    for (const [key, value] of Object.entries({ released: result.released || false, version: result.version || '', tag: result.tag || '', 'release-url': result.url || '' })) {
      appendFileSync(env.GITHUB_OUTPUT, `${key}=${value}\n`)
    }
  }
  if (env.GITHUB_STEP_SUMMARY) {
    appendFileSync(env.GITHUB_STEP_SUMMARY, `## Version\n\n${result.simulated ? '**Simulation** — aucun tag créé.\n\n' : ''}${result.reason || (result.tag ? `**${result.tag}**${result.url ? ` — [Release](${result.url})` : ''}` : 'Aucune publication.')}\n`)
  }
}
const allTags = git('tag', '--list', 'v*').split('\n').filter(name => name.startsWith('v') && semver.valid(name.slice(1)))
  .map(name => ({ name, sha: git('rev-list', '-n', '1', name) }))
const latestStable = stableTags(allTags)[0]
// A slow older CI must never create a release behind a newer published commit.
if (latestStable && latestStable.sha !== sha) {
  try {
    git('merge-base', '--is-ancestor', sha, latestStable.sha)
    output({ released: false, reason: 'Un commit plus récent a déjà été publié.' })
    process.exit(0)
  } catch (error) {
    if (error.status !== 1) throw error
  }
}
const reachable = new Set(git('tag', '--merged', sha, '--list', 'v*').split('\n'))
const tags = allTags.filter(tag => reachable.has(tag.name))
const baseline = stableTags(tags)[0]
const range = baseline ? `${baseline.name}..${sha}` : sha
const commits = git('log', '-z', '--format=%H%n%B', range).split('\0').filter(Boolean).map(entry => {
  const newline = entry.indexOf('\n')
  return { hash: entry.slice(0, newline), message: entry.slice(newline + 1).trim() }
})
let labels = []
if (env.GITHUB_EVENT_NAME === 'push') {
  const prs = (await pages(`/commits/${sha}/pulls`)).filter(pr => pr.merged_at && pr.base.ref === branch && pr.merge_commit_sha === sha)
  if (prs.length > 1) throw new Error('Plusieurs PR de publication correspondent au commit ; utiliser le formulaire Actions.')
  labels = prs[0]?.labels.map(label => label.name) || []
}
const options = resolveOptions({ bump: env.RELEASE_BUMP || 'auto', suffix: env.RELEASE_SUFFIX || '', labels })
const bump = options.bump === 'auto' ? await automaticBump(commits) : options.bump
const plan = planRelease({ tags, sha, bump, suffix: options.suffix })
const collision = allTags.find(tag => tag.name === plan.tag && tag.sha !== sha)
if (collision) throw new Error(`Le tag ${plan.tag} existe déjà sur un autre commit ; il ne sera pas déplacé.`)

// Bootstrap the label picker once per consumer repository. Simulations stay read-only.
if (!dryRun) {
  const present = new Set((await pages('/labels')).map(label => label.name))
  for (const label of releaseLabels) if (!present.has(label.name)) await api('POST', '/labels', label)
}
const result = await publishRelease(api, {
  plan, sha, dryRun,
  summary: `Version calculée depuis les commits validés sur \`${branch}\` (${bump}${options.suffix ? `, canal ${options.suffix}` : ', stable'}).`,
})
output(result)
