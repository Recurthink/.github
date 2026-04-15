# Security Policy

## Versions supportées

Seule la dernière version stable en production reçoit des correctifs de sécurité.

| Version | Support |
|---------|---------|
| `main` (latest) | ✅ Supportée |
| Branches antérieures | ❌ Non supportées |

---

## Signaler une vulnérabilité

**Ne crée pas d'issue publique GitHub pour signaler une faille de sécurité.**

Pour signaler une vulnérabilité de manière responsable :

1. **Email :** [security@recurth.ink](mailto:security@recurth.ink)
2. **GitHub Private Advisory :** via l'onglet Security > Advisories du repo concerné

### Ce qu'il faut inclure

- Description de la vulnérabilité et son impact potentiel
- Étapes détaillées pour la reproduire
- Version / commit affecté
- Proof of concept (si disponible)
- Suggestion de correctif (optionnel mais apprécié)

---

## Processus de réponse

| Étape | Délai cible |
|-------|-------------|
| Accusé de réception | 48h |
| Évaluation initiale | 5 jours ouvrés |
| Correctif déployé | Selon sévérité (critique : 7j, high : 14j, medium : 30j) |
| Divulgation publique | Après déploiement du correctif |

---

## Scope

Les vulnérabilités dans les domaines suivants sont prioritaires :

- **Authentification et autorisation** — accès non autorisé à des données
- **Injections** — SQL, XSS, CSRF, command injection
- **Exposition de données sensibles** — PII, credentials, tokens
- **Dépendances** — vulnérabilités connues dans les packages

Les rapports hors scope (ex: best practices sans impact de sécurité, issues de configuration locale) ne seront pas traités comme des vulnérabilités.

---

*Recurthink — Make It Last.*
