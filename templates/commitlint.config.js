/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ["@commitlint/config-conventional"],

  rules: {
    // Type obligatoire, en minuscules
    "type-enum": [
      2,
      "always",
      [
        "feat",     // Nouvelle fonctionnalité → minor bump
        "fix",      // Correction de bug → patch bump
        "perf",     // Amélioration de performance → patch bump
        "refactor", // Refactoring → patch bump
        "chore",    // Maintenance, deps → no release
        "docs",     // Documentation → no release
        "style",    // Formatage → no release
        "test",     // Tests → no release
        "ci",       // CI/CD → no release
        "revert",   // Revert d'un commit précédent
        "build",    // Système de build → no release
      ],
    ],
    "type-case": [2, "always", "lower-case"],
    "type-empty": [2, "never"],

    // Scope optionnel mais en minuscules si présent
    "scope-case": [2, "always", "lower-case"],

    // Subject : première lettre en minuscule, pas de point final
    "subject-case": [2, "always", "lower-case"],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "subject-max-length": [2, "always", 72],

    // Body : ligne vide avant, max 100 chars par ligne
    "body-leading-blank": [1, "always"],
    "body-max-line-length": [2, "always", 100],

    // Footer : ligne vide avant
    "footer-leading-blank": [1, "always"],
    "footer-max-line-length": [2, "always", 100],
  },

  // Message d'aide personnalisé affiché en cas d'erreur
  helpUrl: "https://github.com/Recurthink/.github/blob/main/CONTRIBUTING.md#conventions-de-commits",
};
