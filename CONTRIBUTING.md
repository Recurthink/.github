# Contributing to Recurthink

Bienvenue. Ce document décrit les conventions et le workflow à suivre pour contribuer aux projets Recurthink. Lis-le avant d'ouvrir une issue ou une PR.

---

## 📋 Table des matières

- [Workflow Git](#workflow-git)
- [Conventions de branches](#conventions-de-branches)
- [Conventions de commits](#conventions-de-commits)
- [Versioning automatique](#versioning-automatique)
- [Ouvrir une issue](#ouvrir-une-issue)
- [Ouvrir une pull request](#ouvrir-une-pull-request)
- [Standards de code](#standards-de-code)

---

## Workflow Git

On utilise **GitHub Flow** étendu avec une branche d'intégration :

```
main          ← production, protégée
  └── develop ← intégration continue
        ├── feature/*   ← nouvelles fonctionnalités
        ├── fix/*        ← corrections de bugs
        ├── chore/*      ← maintenance, deps, config
        ├── refactor/*   ← refactoring
        ├── docs/*       ← documentation
        └── ci/*         ← CI/CD

hotfix/*  ← urgences prod (merge sur main ET develop)
release/* ← préparation de release formelle (optionnel)
```

### Flux standard

1. Crée une branche depuis `develop`
2. Développe et commit en respectant les Conventional Commits
3. Ouvre une PR vers `develop` — la CI doit être au vert
4. Merge dans `develop`
5. Quand `develop` est stable, ouvre une PR `develop → main`
6. Merge sur `main` déclenche automatiquement le versioning et la release

### Flux hotfix (urgence production)

1. Crée `hotfix/<description>` depuis `main`
2. Corrige le problème
3. Ouvre une PR vers `main` — CI obligatoire
4. Après merge sur `main` → semantic-release crée automatiquement le patch tag
5. **Back-merge obligatoire** : ouvre aussi une PR `hotfix/<x> → develop` pour ne pas perdre le fix

---

## Conventions de branches

Format : `<type>/<description-courte-en-kebab-case>`

| Type | Usage | Base | Merge vers |
|------|-------|------|-----------|
| `feature/` | Nouvelle fonctionnalité | `develop` | `develop` |
| `fix/` | Correction de bug non-critique | `develop` | `develop` |
| `chore/` | Maintenance, mise à jour de dépendances | `develop` | `develop` |
| `refactor/` | Refactoring | `develop` | `develop` |
| `docs/` | Documentation | `develop` | `develop` |
| `ci/` | CI/CD | `develop` | `develop` |
| `perf/` | Performance | `develop` | `develop` |
| `hotfix/` | Urgence production | `main` | `main` + `develop` |
| `release/` | Préparation release | `develop` | `main` + `develop` |

**Exemples :**
```
feature/hero-parallax-scroll
fix/lenis-scroll-overflow
chore/update-astro-5
refactor/card-component
hotfix/broken-navigation-mobile
release/v2.0.0
```

---

## Conventions de commits

On suit **[Conventional Commits](https://www.conventionalcommits.org/)**.
La validation est automatique via `commitlint` + `husky` (voir [templates/husky-setup.md](../templates/husky-setup.md)).

```
<type>(<scope>): <description courte>

[corps optionnel]

[footer optionnel — ex: BREAKING CHANGE: ...]
```

### Types et impact sur le versioning

| Type | Bump | Usage |
|------|------|-------|
| `feat` | **minor** `v1.1.0` | Nouvelle fonctionnalité |
| `fix` | **patch** `v1.0.1` | Correction de bug |
| `perf` | **patch** `v1.0.1` | Amélioration de performance |
| `refactor` | **patch** `v1.0.1` | Refactoring |
| `chore` | — aucun release | Maintenance, deps |
| `docs` | — aucun release | Documentation |
| `style` | — aucun release | Formatage |
| `test` | — aucun release | Tests |
| `ci` | — aucun release | CI/CD |
| `revert` | — | Revert d'un commit |
| `feat!` ou `BREAKING CHANGE:` | **major** `v2.0.0` | Breaking change |

> **Note :** Le versioning est calculé sur l'ensemble des commits depuis le dernier tag.
> Si une PR contient un `feat` et trois `fix`, c'est le `feat` qui prend le dessus → bump minor.

### Scopes suggérés (adapter par projet)

`ui`, `api`, `db`, `auth`, `i18n`, `infra`, `deps`, `config`, `hero`, `nav`, `layout`

### Exemples

```
feat(ui): add animated hero scroll indicator
fix(i18n): correct French translation for CTA button
chore(deps): update astro to 5.18.1
refactor(ui): extract WwdCard into standalone component
perf(images): switch to avif format for hero assets
ci: add bun build check on pull_request
docs: add deployment guide to README
feat!: redesign API response format

BREAKING CHANGE: all API responses now use camelCase keys instead of snake_case
```

### Règles

- Description en **minuscules**, sans point final, max **72 caractères**
- Corps et footer séparés par une ligne vide
- Référencer l'issue dans le footer : `Closes #42`

---

## Versioning automatique

Sur chaque merge vers `main`, **semantic-release** analyse automatiquement les commits depuis le dernier tag et :

1. Détermine le prochain numéro de version (SemVer)
2. Crée le **Git tag** (`v1.2.3`)
3. Génère les **notes de release** à partir des commits
4. Met à jour **CHANGELOG.md**
5. Crée la **GitHub Release**
6. Déclenche le **deploy Coolify** via webhook

Sur `develop`, les merges génèrent des **pre-releases** (`v1.2.3-beta.1`) accessibles sans polluer le canal stable.

**Tu n'as jamais à créer un tag manuellement.** Écris juste des bons commits.

---

## Ouvrir une issue

Utilise les templates fournis — ils sont là pour une raison.

- **Bug** → décris les étapes de reproduction, le comportement attendu vs observé
- **Feature** → explique le problème que ça résout avant de proposer une solution
- **Task** → détaille les sous-tâches et une Definition of Done claire

Assigne les labels appropriés. Ne crée pas d'issue pour une question générale — utilise les Discussions.

---

## Ouvrir une pull request

1. Assure-toi que ta branche est à jour avec sa base (`develop` ou `main` pour hotfix)
2. Remplis le template PR complètement
3. Lie l'issue avec `Closes #X` dans la description
4. La CI doit être au vert (build + type check)
5. Assigne un reviewer si applicable

**Taille des PRs :** garde-les petites et focalisées. Une PR = une chose. Les PRs géantes sont difficiles à reviewer et à rollback.

---

## Standards de code

### Général
- Pas de `console.log` laissés en production
- Pas de code commenté — supprime plutôt que de commenter
- Les TODO doivent référencer une issue : `// TODO: #42 — améliorer la gestion des erreurs`

### TypeScript / Astro / Vue
- TypeScript strict (`strict: true`)
- Pas de `any` explicite — utilise `unknown` si nécessaire
- Composants Astro : logique dans le frontmatter, template le plus simple possible
- Composants Vue : `<script setup lang="ts">` obligatoire

### .NET / C#
- Respecter les conventions de nommage C# (PascalCase, camelCase)
- Pas de magic strings — utilise des constantes ou des enums
- Nullable reference types activés (`<Nullable>enable</Nullable>`)

### CSS / Tailwind
- Tailwind v4 — pas de config JS, tout dans les directives CSS
- Pas de styles inline sauf pour des valeurs dynamiques
- Les animations complexes vont dans des fichiers dédiés (GSAP)

---

*Recurthink — Make It Last.*
