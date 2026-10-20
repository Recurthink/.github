# Versions Recurthink

Une publication crée un tag `vX.Y.Z` et une GitHub Release sur le commit validé.
Le code du projet et son lockfile ne sont pas modifiés pendant cette opération.
Les notes sont produites par GitHub et les outils de version sont installés séparément, avec un lockfile.

## Automatique

Après la CI sur `main`, les commits depuis le dernier tag stable déterminent la version :

| Changement | Exemple depuis v1.0.0 |
| --- | --- |
| `fix`, `perf`, `refactor` | v1.0.1 (patch) |
| `feat` | v1.1.0 (minor) |
| `!` dans l’en-tête ou `BREAKING CHANGE:` | v2.0.0 (major) |
| `docs`, `ci`, `chore`, `style`, `test` sans rupture | aucune version |

Le changement le plus important gagne. Les commits de fusion ne masquent pas les commits qu’ils intègrent.
La première version d’un projet sans tag est `v1.0.0`.
Avec un squash, conserver un titre de PR Conventional Commits ou utiliser un label explicite.

## Choisir sur la PR vers main

Dans **Labels**, choisir au maximum un de ces labels :

- `release:patch` : petite version ;
- `release:minor` : version intermédiaire ;
- `release:major` : version majeure ;
- `release:none` : aucune publication.

Sans label, le calcul reste automatique. Le choix explicite remplace celui des commits.
Le workflow **Choix de version** rejette les choix contradictoires avant la fusion.
Le template de PR est commun à l’organisation ; les règles de version ne s’appliquent qu’à la branche de publication.
Les formulaires YAML GitHub existent pour les issues, pas pour les PR : le menu Labels est utilisé ici.

## Préversions

Ajouter un seul label `release:channel:dev`, `release:channel:canary` ou `release:channel:rc`.
Un suffixe personnalisé est possible avec un label `release:channel:<suffixe>` créé par un mainteneur.

Depuis `v1.0.0`, une version minor sur le canal dev crée **`v1.1.0-dev`**.
Une autre publication sur le même canal crée `v1.1.0-dev.1`, puis `.2`.
Une relance sur le même commit et le même canal ne crée pas de nouvelle version.
Les préversions ne deviennent jamais la release « Latest ».

Pour promouvoir une préversion en stable, laisser le suffixe vide dans Actions :
la version reste calculée depuis le dernier tag stable, par exemple `v1.1.0-dev.2` → `v1.1.0`.
`develop` ne publie pas automatiquement de versions ; le suffixe est indépendant du nom de la branche.

## Formulaire Actions

Dans **Actions → le workflow CI ou Version → Run workflow**, sélectionner la branche de publication :

1. Type : `auto`, `patch`, `minor`, `major` ou `none`.
2. Suffixe facultatif : `dev`, `canary`, `rc`… Laisser vide pour une version stable.
3. Cocher **Simulation** pour prévisualiser la version sans créer de tag.

Lors d’un lancement manuel, seuls les champs du formulaire sont utilisés : les labels d’une ancienne PR
ne sont pas réappliqués. `auto` continue de lire les commits.
La version prévue ou publiée est affichée dans le résumé du job et dans ses outputs.

## Installation dans un projet

Les templates **Versions Recurthink** et **Choix de version des PR Recurthink** sont proposés dans
**Actions → New workflow** des dépôts de l’organisation. Chaque dépôt doit ajouter ces workflows :
GitHub hérite des templates communautaires, mais ne lance pas automatiquement les workflows de `.github`
dans les autres dépôts.

Si le projet possède déjà une CI, ajouter le formulaire `workflow_dispatch` du template et appeler
le workflow de release depuis un job `needs: ci`. C’est le montage utilisé par `recurthink-website`.
Le workflow autonome suppose que `main` reçoit du code déjà validé ; l’intégration à la CI reste préférable.

```yaml
release:
  needs: ci
  if: github.ref == 'refs/heads/main' && (github.event_name == 'push' || github.event_name == 'workflow_dispatch')
  permissions:
    contents: write
    issues: write
    pull-requests: read
  uses: Recurthink/.github/.github/workflows/release.yml@main
  with:
    bump: ${{ inputs.bump || 'auto' }}
    suffix: ${{ inputs.suffix || '' }}
    dry-run: ${{ inputs.dry-run || false }}
```

Le `GITHUB_TOKEN` suffit. `RELEASE_TOKEN` est optionnel pour les projets qui utilisent déjà un token dédié.
Les labels sont créés s’ils manquent lors du premier passage hors simulation, même sans version à publier.
Pour les rendre disponibles avant la première fusion, utiliser le catalogue du dépôt `.github` :

```sh
gh label clone Recurthink/.github --repo Recurthink/nom-du-projet
```

Le workflow de validation ne lance pas le code de la PR et ne crée aucun tag.
Les publications sont sérialisées ; un tag existant ne peut pas être déplacé sur un autre commit.
Les versions dépendent de l’historique Git, pas des versions de `package.json`.
Le workflow ne déclenche aucun déploiement : chaque projet conserve sa CI de déploiement.

## Tester les outils

```sh
npm ci --prefix release --ignore-scripts
npm test --prefix release
```

`tooling-ref` permet de tester les workflows d’une PR du dépôt partagé avant sa fusion.
Pour un projet qui doit figer ses outils, épingler à la même révision l’appel du workflow et `tooling-ref`.
