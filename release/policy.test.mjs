import { test } from 'node:test'
import assert from 'node:assert/strict'
import { automaticBump, resolveOptions, planRelease, stableTags, validateSuffix } from './policy.mjs'
import { publishRelease } from './publish.mjs'

const sha = 'a'.repeat(40)
const tags = [{ name: 'v1.0.0', sha: 'b'.repeat(40) }]
const commits = (...messages) => messages.map((message, i) => ({ hash: String(i), message }))

for (const [message, expected] of [
  ['fix(ui): corriger le menu', 'patch'],
  ['perf: réduire les images', 'patch'],
  ['refactor: extraire un composant', 'patch'],
  ['feat: ajouter une recherche', 'minor'],
  ['feat(api)!: changer les réponses', 'major'],
  ['fix: changer les réponses\n\nBREAKING CHANGE: nouveau format', 'major'],
  ['docs!: remplacer le protocole public', 'major'],
  ['ci: mettre à jour un workflow', 'none'],
  ['docs: documenter une commande', 'none'],
  ['Merge pull request #42 from Recurthink/develop', 'none'],
]) test(`Conventional Commits: ${message.split('\n')[0]}`, async () => {
  assert.equal(await automaticBump(commits(message)), expected)
})

test('le changement le plus important gagne, même derrière des commits de fusion', async () => {
  assert.equal(await automaticBump(commits('Merge pull request #42', 'fix: corriger', 'feat: créer')), 'minor')
  assert.equal(await automaticBump(commits('feat: créer', 'feat!: casser la compatibilité', 'fix: corriger')), 'major')
})

test('aucun commit ne déclenche pas de release', async () => {
  assert.equal(await automaticBump([]), 'none')
})

test('les labels forcent le type et le canal', () => {
  assert.deepEqual(resolveOptions({ labels: ['bug', 'release:minor', 'release:channel:dev'] }), { bump: 'minor', suffix: 'dev' })
  assert.deepEqual(resolveOptions(), { bump: 'auto', suffix: '' })
})

test('les choix Actions explicites gagnent sur les labels', () => {
  assert.deepEqual(resolveOptions({ bump: 'major', suffix: 'rc', labels: ['release:patch', 'release:channel:dev'] }), { bump: 'major', suffix: 'rc' })
})

test('les choix contradictoires ou invalides sont rejetés avant toute écriture', () => {
  for (const labels of [
    ['release:minor', 'release:patch'],
    ['release:channel:dev', 'release:channel:rc'],
    ['release:none', 'release:channel:dev'],
    ['release:channel:'],
  ]) assert.throws(() => resolveOptions({ labels }))
  assert.throws(() => resolveOptions({ bump: 'medium' }))
  for (const suffix of ['dev test', '-dev', '-dev!', 'dev/1', 'dev\ncanary', '01', 'dev.01', '$(id)']) assert.throws(() => validateSuffix(suffix))
  assert.equal(validateSuffix('dev'), 'dev')
  assert.equal(validateSuffix('canary.eu'), 'canary.eu')
})

for (const [bump, tag] of [['patch', 'v1.0.1'], ['minor', 'v1.1.0'], ['major', 'v2.0.0']]) {
  test(`1.0.0 + ${bump} = ${tag}`, () => {
    assert.equal(planRelease({ tags, sha, bump }).tag, tag)
  })
}

test('la première publication est 1.0.0 et seuls les tags semver v sont utilisés', () => {
  assert.equal(planRelease({ tags: [], sha, bump: 'minor' }).tag, 'v1.0.0')
  assert.deepEqual(stableTags([...tags, { name: 'deploy-2026', sha }, { name: 'v99.0.0-dev', sha }, { name: 'vbad', sha }]), tags)
})

test('suffixe demandé, répétition du canal, puis promotion stable', () => {
  const first = planRelease({ tags, sha, bump: 'minor', suffix: 'dev' })
  assert.equal(first.tag, 'v1.1.0-dev')
  assert.equal(first.prerelease, true)
  const nextTags = [...tags, { name: first.tag, sha }]
  assert.equal(planRelease({ tags: nextTags, sha: 'c'.repeat(40), bump: 'minor', suffix: 'dev' }).tag, 'v1.1.0-dev.1')
  nextTags.push({ name: 'v1.1.0-dev.1', sha: 'c'.repeat(40) })
  assert.equal(planRelease({ tags: nextTags, sha: 'd'.repeat(40), bump: 'minor', suffix: 'dev' }).tag, 'v1.1.0-dev.2')
  assert.equal(planRelease({ tags: nextTags, sha, bump: 'minor', suffix: 'canary' }).tag, 'v1.1.0-canary')
  const stable = planRelease({ tags: nextTags, sha, bump: 'minor' })
  assert.equal(stable.tag, 'v1.1.0')
  assert.equal(stable.prerelease, false)
})

test('relancer le même commit et canal ne change pas de version', () => {
  const published = [...tags, { name: 'v1.1.0-dev', sha }]
  assert.equal(planRelease({ tags: published, sha, bump: 'minor', suffix: 'dev' }).tag, 'v1.1.0-dev')
  assert.equal(planRelease({ tags: [...tags, { name: 'v1.1.0', sha }], sha, bump: 'major' }).tag, 'v1.1.0')
  assert.equal(planRelease({ tags, sha, bump: 'none' }).skipped, true)
})

test('une simulation ne contacte pas les endpoints de publication', async () => {
  const result = await publishRelease(() => assert.fail('aucun appel API en simulation'), {
    plan: planRelease({ tags, sha, bump: 'minor', suffix: 'dev' }), sha, dryRun: true,
  })
  assert.equal(result.tag, 'v1.1.0-dev')
  assert.equal(result.released, false)
  assert.equal(result.simulated, true)
})

test('la publication vise le SHA validé et la préversion ne devient pas latest', async () => {
  const calls = []
  const api = async (method, path, body) => {
    calls.push({ method, path, body })
    if (method === 'GET') return null
    if (path.endsWith('generate-notes')) return { body: 'Notes' }
    return { html_url: 'https://github.com/Recurthink/test/releases/tag/v1.1.0-dev' }
  }
  const result = await publishRelease(api, { plan: planRelease({ tags, sha, bump: 'minor', suffix: 'dev' }), sha, dryRun: false })
  assert.equal(result.released, true)
  assert.equal(calls.at(-1).body.target_commitish, sha)
  assert.equal(calls.at(-1).body.tag_name, 'v1.1.0-dev')
  assert.equal(calls.at(-1).body.prerelease, true)
  assert.equal(calls.at(-1).body.make_latest, 'false')
})

test('une release déjà créée ne génère ni nouveau tag ni nouvelle publication', async () => {
  let count = 0
  const result = await publishRelease(async method => { count++; assert.equal(method, 'GET'); return { html_url: 'https://github.com/example/release' } }, {
    plan: planRelease({ tags, sha, bump: 'patch' }), sha, dryRun: false,
  })
  assert.equal(count, 1)
  assert.equal(result.released, false)
})
