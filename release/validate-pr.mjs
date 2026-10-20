import { readFileSync, appendFileSync } from 'node:fs'
import { resolveOptions } from './policy.mjs'
const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'))
if (!event.pull_request) throw new Error('Ce contrôle attend une pull request.')
const result = resolveOptions({ labels: event.pull_request.labels.map(label => label.name) })
const message = `Version : ${result.bump === 'auto' ? 'automatique selon les commits' : result.bump}. Canal : ${result.suffix || 'stable'}.`
console.log(message)
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Choix de publication\n\n${message}\n\nAucun tag n’est créé par ce contrôle.\n`)
