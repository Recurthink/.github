# Setup commitlint + husky

Template à intégrer dans chaque nouveau projet Recurthink pour valider les commits localement.

## Installation

```bash
# Ajouter les devDependencies
bun add --dev \
  husky \
  @commitlint/cli \
  @commitlint/config-conventional

# Initialiser husky
bunx husky init
```

## Fichiers à créer

### `commitlint.config.js` — à la racine du projet

Copier le fichier `templates/commitlint.config.js` depuis ce repo.

### `.husky/commit-msg` — hook git

```bash
# Créé automatiquement par husky init, remplacer le contenu par :
bunx --no -- commitlint --edit "$1"
```

### `package.json` — ajouter le script prepare

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

> Le script `prepare` est exécuté automatiquement par bun/npm à chaque `bun install`,
> ce qui installe les hooks git pour tous les contributeurs du projet.

## Comportement

Après setup, chaque tentative de `git commit` avec un message invalide sera bloquée :

```
$ git commit -m "ajout du composant hero"
⧗   input: ajout du composant hero
✖   subject may not be empty [subject-empty]
✖   type may not be empty [type-empty]

✖   found 2 problems, 0 warnings
ⓘ   Get help: https://github.com/Recurthink/.github/blob/main/CONTRIBUTING.md#conventions-de-commits

husky - commit-msg script failed (code 1)
```

```
$ git commit -m "feat(hero): add parallax scroll animation"
[feature/hero-parallax 3a8c21f] feat(hero): add parallax scroll animation
```

## Référence des types

| Type | Bump | Usage |
|------|------|-------|
| `feat` | minor | Nouvelle fonctionnalité |
| `fix` | patch | Correction de bug |
| `perf` | patch | Performance |
| `refactor` | patch | Refactoring |
| `chore` | — | Maintenance, deps |
| `docs` | — | Documentation |
| `style` | — | Formatage |
| `test` | — | Tests |
| `ci` | — | CI/CD |
| `revert` | — | Revert |
| `feat!` / `BREAKING CHANGE:` | **major** | Breaking change |

## Exemples valides

```
feat(ui): add hero scroll indicator
fix(i18n): correct french translation for cta
chore(deps): update astro to 5.18.1
refactor(card): extract wwd-card into standalone component
ci: update bun version in ci workflow
docs: add setup instructions to readme
feat!: redesign navigation — breaking layout changes
```
