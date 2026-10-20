export async function publishRelease(api, { plan, sha, dryRun, summary = '' }) {
  if (plan.skipped) return { released: false, reason: plan.reason }
  if (dryRun) return { released: false, simulated: true, ...plan }
  const existing = await api('GET', `/releases/tags/${encodeURIComponent(plan.tag)}`, undefined, true)
  if (existing) return { ...plan, released: false, existing: true, url: existing.html_url }
  const notes = await api('POST', '/releases/generate-notes', {
    tag_name: plan.tag,
    target_commitish: sha,
    ...(plan.previousTag && plan.previousTag !== plan.tag ? { previous_tag_name: plan.previousTag } : {}),
  })
  // GitHub creates the missing tag on this exact SHA together with the release.
  const release = await api('POST', '/releases', {
    tag_name: plan.tag,
    target_commitish: sha,
    name: plan.tag,
    body: `${summary}\n\n${notes.body}`.trim(),
    draft: false,
    prerelease: plan.prerelease,
    make_latest: plan.prerelease ? 'false' : 'true',
  })
  return { ...plan, released: true, url: release.html_url }
}
