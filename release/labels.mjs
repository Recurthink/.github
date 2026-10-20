export const releaseLabels = [
  { name: 'release:patch', color: '1d76db', description: 'Forcer une petite version : 1.0.0 → 1.0.1' },
  { name: 'release:minor', color: '5319e7', description: 'Forcer une version intermédiaire : 1.0.0 → 1.1.0' },
  { name: 'release:major', color: 'b60205', description: 'Forcer une version majeure : 1.0.0 → 2.0.0' },
  { name: 'release:none', color: '6e7781', description: 'Ne pas créer de version pour cette fusion' },
  { name: 'release:channel:dev', color: 'd4c5f9', description: 'Publier une préversion avec le suffixe dev' },
  { name: 'release:channel:canary', color: 'fbca04', description: 'Publier une préversion avec le suffixe canary' },
  { name: 'release:channel:rc', color: 'bfdadc', description: 'Publier une release candidate avec le suffixe rc' },
]
