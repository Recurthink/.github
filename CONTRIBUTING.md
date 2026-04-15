# Contributing to Recurthink

Bienvenue. Ce document décrit les conventions et le workflow à suivre pour contribuer aux projets Recurthink. Lis-le avant d'ouvrir une issue ou une PR.

---

## 📋 Table des matières

- [Workflow Git](#workflow-git)
- [Conventions de branches](#conventions-de-branches)
- [Conventions de commits](#conventions-de-commits)
- [Ouvrir une issue](#ouvrir-une-issue)
- [Ouvrir une pull request](#ouvrir-une-pull-request)
- [Standards de code](#standards-de-code)

---

## Workflow Git

On utilise **GitHub Flow** :

1. `main` est toujours déployable — c'est la production
2. `develop` est la branche d'intégration — les features convergent ici avant de merger sur `main`
3. Pour toute modification, crée une branche depuis `develop`
4. Ouvre une PR vers `develop` quand c'est prêt
5. La CI doit être au vert avant tout merge
6. Pas de push direct sur `main` ou `develop`

```
main ─────────────────────────────────────── (production)
  └── develop ──────────────────────────────── (intégration)
        ├── feature/mon-composant
        ├── fix/bug-animation
        └── chore/mise-a-jour-deps
```

---

## Conventions de branches

Format : `<type>/<description-courte-en-kebab-case>`

| Type | Usage |
|------|-------|
| `feature/` | Nouvelle fonctionnalité |
| `fix/` | Correction de bug |
| `chore/` | Maintenance, mise à jour de dépendances |
| `refactor/` | Refactoring sans changement de comportement |
| `docs/` | Documentation uniquement |
| `ci/` | Modifications de la CI/CD |
| `perf/` | Amélioration de performance |

**Exemples :**
```
feature/hero-parallax-scroll
fix/lenis-scroll-overflow
chore/update-astro-5
refactor/card-component
```

---

## Conventions de commits

On suit **[Conventional Commits](https://www.conventionalcommits.org/)**.

```
<type>(<scope>): <description courte>

[corps optionnel]

[footer optionnel — ex: BREAKING CHANGE: ...]
```

### Types

| Type | Usage |
|------|-------|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `chore` | Maintenance (deps, config, tooling) |
| `refactor` | Refactoring |
| `docs` | Documentation |
| `style` | Formatage, espaces (pas de logique) |
| `test` | Ajout ou modification de tests |
| `ci` | CI/CD |
| `perf` | Performance |
| `revert` | Revenir sur un commit |

### Scopes suggérés (adapter par projet)

`ui`, `api`, `db`, `auth`, `i18n`, `infra`, `deps`, `config`

### Exemples

```
feat(ui): add animated hero scroll indicator
fix(i18n): correct French translation for CTA button
chore(deps): update astro to 5.18.1
refactor(ui): extract WwdCard into standalone component
ci: add bun build check on pull_request
```

### Règles

- Description en **minuscules**, sans point final
- Maximum **72 caractères** pour la ligne de titre
- Corps en Français ou Anglais — sois consistant dans un même repo
- Référencer l'issue dans le footer : `Closes #42`

---

## Ouvrir une issue

Utilise les templates fournis — ils sont là pour une raison.

- **Bug** → décris les étapes de reproduction, le comportement attendu vs observé
- **Feature** → explique le problème que ça résout avant de proposer une solution
- **Task** → détaille les sous-tâches et une Definition of Done claire

Assigne les labels appropriés. Ne crée pas d'issue pour une question générale — utilise les Discussions.

---

## Ouvrir une pull request

1. Assure-toi que ta branche est à jour avec `develop`
2. Remplis le template PR complètement
3. Lie l'issue avec `Closes #X` dans la description
4. La CI doit être au vert (build + lint)
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

### CSS / Tailwind
- Tailwind v4 — pas de config JS, tout dans les directives CSS
- Pas de styles inline sauf pour des valeurs dynamiques
- Les animations complexes vont dans des fichiers dédiés (GSAP)

---

*Recurthink — Make It Last.*
