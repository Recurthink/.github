import semver from 'semver'
import { analyzeCommits } from '@semantic-release/commit-analyzer'
import { fileURLToPath } from 'node:url'

const bumps = new Set(['auto', 'patch', 'minor', 'major', 'none'])

export function validateSuffix(value = '') {
  const suffix = value.trim()
  if (suffix && (!/^[0-9A-Za-z][0-9A-Za-z-]*(?:\.[0-9A-Za-z][0-9A-Za-z-]*)*$/.test(suffix) || !semver.valid(`0.0.0-${suffix}`))) {
    throw new Error('Suffixe invalide : utiliser par exemple dev, canary ou rc (sans espaces ni préfixe -).')
  }
  return suffix
}

export function resolveOptions({ bump = 'auto', suffix = '', labels = [] } = {}) {
  if (!bumps.has(bump)) throw new Error(`Type de version inconnu : ${bump}`)
  const choices = labels.filter(label => /^release:(patch|minor|major|none)$/.test(label))
  const channels = labels.filter(label => label.startsWith('release:channel:'))
  if (choices.length > 1) throw new Error('Choisir un seul label de version : release:patch, release:minor, release:major ou release:none.')
  if (channels.length > 1) throw new Error('Choisir un seul label release:channel:<suffixe>.')
  const labelSuffix = channels[0]?.slice('release:channel:'.length)
  if (labelSuffix === '') throw new Error('Le label de canal doit contenir un suffixe.')
  // Validate even when an explicit Actions input takes precedence.
  if (labelSuffix) validateSuffix(labelSuffix)
  const selectedBump = bump !== 'auto' ? bump : choices[0]?.slice('release:'.length) || 'auto'
  const selectedSuffix = validateSuffix(suffix || labelSuffix || '')
  if (selectedBump === 'none' && selectedSuffix) throw new Error('release:none ne peut pas être associé à un canal de publication.')
  return { bump: selectedBump, suffix: selectedSuffix }
}

export async function automaticBump(commits) {
  return (await analyzeCommits({
    preset: 'conventionalcommits',
    releaseRules: [
      { breaking: true, release: 'major' },
      { type: 'refactor', release: 'patch' },
    ],
  }, {
    cwd: fileURLToPath(new URL('.', import.meta.url)),
    commits,
    logger: { log() {}, error() {} },
  })) || 'none'
}

export function stableTags(tags) {
  return tags.filter(tag => /^v/.test(tag.name) && semver.valid(tag.name.slice(1)) && !semver.prerelease(tag.name.slice(1)))
    .sort((a, b) => semver.rcompare(a.name.slice(1), b.name.slice(1)))
}

function onChannel(version, suffix) {
  const pre = semver.prerelease(version)
  if (!suffix) return !pre
  if (!pre) return false
  const identifiers = suffix.split('.')
  return identifiers.every((value, i) => String(pre[i]) === value)
    && (pre.length === identifiers.length || (pre.length === identifiers.length + 1 && typeof pre.at(-1) === 'number'))
}

export function planRelease({ tags, sha, bump, suffix = '' }) {
  validateSuffix(suffix)
  if (!bumps.has(bump) || bump === 'auto') throw new Error('Le type de version doit être résolu avant le calcul.')
  const stable = stableTags(tags)[0]
  const existing = tags.filter(tag => tag.sha === sha && semver.valid(tag.name.slice(1)) && tag.name.startsWith('v') && onChannel(tag.name.slice(1), suffix))
    .sort((a, b) => semver.rcompare(a.name.slice(1), b.name.slice(1)))[0]
  if (bump === 'none') return { skipped: true, reason: 'Aucun changement publiable.', previousTag: stable?.name }
  if (existing) return { tag: existing.name, version: existing.name.slice(1), prerelease: Boolean(suffix), existing: true, previousTag: stable?.name }
  const base = stable ? semver.inc(stable.name.slice(1), bump) : '1.0.0'
  let version = base
  if (suffix) {
    const first = `${base}-${suffix}`
    const siblings = tags.map(tag => tag.name.slice(1)).filter(value => value === first || (value.startsWith(`${first}.`) && /^\d+$/.test(value.slice(first.length + 1))))
    version = siblings.length ? `${first}.${Math.max(0, ...siblings.map(value => value === first ? 0 : Number(value.slice(first.length + 1)))) + 1}` : first
  }
  if (!semver.valid(version)) throw new Error(`Version invalide : ${version}`)
  return { tag: `v${version}`, version, prerelease: Boolean(suffix), existing: false, previousTag: stable?.name }
}
