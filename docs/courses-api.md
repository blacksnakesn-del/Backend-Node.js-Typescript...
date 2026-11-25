# API des cours, modules et leçons

Ce document décrit l’API de gestion des cours actuellement implémentée dans ce projet : ses routes, les formats attendus, les règles métier, les relations en base et des exemples d’utilisation avec `curl`.

## URL de base

Le routeur de cours est monté sous `/api`. Avec le serveur de développement par défaut, l’URL de base est donc :

```text
http://localhost:3000/api
```

Les chemins documentés ci-dessous sont relatifs à cette URL. Par exemple, `GET /courses` correspond à `GET http://localhost:3000/api/courses`.

Les routes `GET /courses`, `POST /courses` et `PATCH` exigent un access token Bearer. La création et la modification exigent le rôle `teacher` ou `admin`. Un professeur ne peut créer un cours que pour lui-même ; un administrateur peut assigner le cours à un professeur actif. Les autres routes de cours n’ajoutent actuellement pas de middleware d’authentification ou de rôle. Toutes restent soumises aux middlewares généraux, notamment le rate limiter.

## Résumé des routes

| Méthode | Chemin | Succès | Fonction |
|---|---|---:|---|
| `GET` | `/courses` | `200` | Liste tous les cours. |
| `POST` | `/courses` | `201` | Crée un cours brouillon pour le professeur désigné. |
| `GET` | `/courses/:id` | `200` | Récupère un cours par son UUID. |
| `PATCH` | `/courses/:idCours` | `200` | Modifie partiellement un cours ; un alias est disponible sous `/test/courses/:idCours`. |
| `DELETE` | `/courses/:id` | `204` | Supprime un cours uniquement s’il est encore en brouillon. |
| `POST` | `/courses/:id/publish` | `200` | Publie le cours. |
| `POST` | `/courses/:id/modules` | `201` | Crée un module rattaché au cours. |
| `POST` | `/courses/modules/:moduleId/lessons` | `201` | Crée une leçon rattachée au module indiqué. |

`id` et `moduleId` doivent être des UUID valides.

## Format général des réponses

Les réponses réussies utilisent l’enveloppe suivante :

```json
{
  "success": true,
  "data": {},
  "request_id": "927d26c0-c408-4d9e-90d3-459b5d0ea790"
}
```

Les objets retournés contiennent les attributs du modèle Sequelize ; selon la route, cela inclut notamment les champs métier, l’identifiant et les horodatages. Pour alléger les exemples, les réponses ci-dessous montrent principalement les champs métier.

Les erreurs peuvent avoir deux formes selon leur origine :

* Une erreur métier créée par `AppError` (par exemple un conflit de suppression) est renvoyée avec un objet `error` :

  ```json
  {
    "success": false,
    "error": {
      "code": "CONFLICT",
      "message": "Seuls les brouillons peuvent être supprimés."
    },
    "request_id": "927d26c0-c408-4d9e-90d3-459b5d0ea790"
  }
  ```

* Certaines réponses 404 produites directement par le contrôleur utilisent `message` à la racine :

  ```json
  {
    "success": false,
    "message": "Cours not found",
    "request_id": "927d26c0-c408-4d9e-90d3-459b5d0ea790"
  }
  ```

Une erreur de validation renvoie le code `VALIDATION_ERROR`, avec les détails fournis par Zod.

Par exemple, une capacité inférieure à `50` lors de la création ou un identifiant qui n’est pas un UUID produit une réponse `400` :

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Les données envoyées sont invalides.",
    "details": {
      "formErrors": [],
      "fieldErrors": {
        "capacite": ["Too small: expected number to be >=50"]
      }
    }
  },
  "request_id": "927d26c0-c408-4d9e-90d3-459b5d0ea790"
}
```

## 1. Lister les cours

```http
GET /api/courses
```

Exemple :

```bash
curl http://localhost:3000/api/courses
```

La réponse contient une liste dans `data` :

```json
{
  "success": true,
  "data": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "name": "Développement Web",
      "description": "Présentation du cours...",
      "proffesseur": "Awa Diop",
      "capacite": 30,
      "lieu": "Salle A",
      "category": "web",
      "published": false
    }
  ],
  "request_id": "927d26c0-c408-4d9e-90d3-459b5d0ea790"
}
```

La route accepte `page` (défaut `1`), `per_page` (défaut `10`, maximum `100`), `search` (nom ou description), `proffesseur`, `capacite`, `lieu`, `category` et `published`. La réponse `data` contient les cours de la page demandée. La clé `meta` contient la pagination et un objet `utilisateur` sûr (identifiant, nom, email, rôle et statut de vérification), sans jeton ni donnée de mot de passe.

Exemple : `GET /api/courses?page=1&per_page=10&category=web`.

## 2. Créer un cours

```http
POST /api/courses
Authorization: Bearer <access-token>
Content-Type: application/json
```

Champs acceptés :

| Champ | Type | Règle |
|---|---|---|
| `name` | chaîne | Facultatif ; vaut `"Nom du Cours"` s’il est omis. |
| `description` | chaîne | Obligatoire, au moins 250 caractères. |
| `proffesseur` | UUID | Obligatoire. Identifiant d’un utilisateur actif ayant le rôle `teacher`. |
| `capacite` | nombre | Obligatoire, au moins `50`. |
| `lieu` | chaîne | Obligatoire. |
| `category` | chaîne | Facultatif ; enum `web`, `data` ou `other`. Vaut `web` si omis. |

Exemple valide :

```bash
curl -X POST http://localhost:3000/api/courses \
  -H 'Authorization: Bearer <teacher_or_admin_access_token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Développement Web",
    "description": "Ce cours présente les bases du développement web, la structure des pages HTML, la mise en forme CSS, les interactions JavaScript et les principes nécessaires pour construire, tester et maintenir une application web accessible et fiable. Les exercices guidés permettent de pratiquer chaque notion, de corriger les erreurs fréquentes et de progresser vers un petit projet complet.",
    "proffesseur": "11111111-1111-4111-8111-111111111111",
    "capacite": 50,
    "lieu": "Salle A",
    "category": "web"
  }'
```

Un cours créé est un brouillon : `published` vaut `false` par défaut. Un nom déjà utilisé provoque une réponse `409 CONFLICT`.
Le professeur connecté doit fournir son propre UUID. Un administrateur peut fournir l’UUID d’un autre professeur actif. L’UUID est vérifié et stocké dans la clé étrangère `cours.proffesseur` vers `users.id`.

## 3. Récupérer le détail d’un cours

```http
GET /api/courses/:id
```

Exemple :

```bash
curl http://localhost:3000/api/courses/11111111-1111-4111-8111-111111111111
```

Un identifiant qui n’est pas un UUID valide est rejeté avec une erreur de validation (`400`). Si l’UUID est valide mais qu’aucun cours ne lui correspond, la route renvoie `404`.

## 4. Modifier partiellement un cours

```http
PATCH /api/test/courses/:idCours
Authorization: Bearer <access-token>
Content-Type: application/json
```

La même opération est également disponible à `PATCH /api/courses/:idCours`.

`idCours` doit être un UUID. Seuls les rôles `teacher` et `admin` sont acceptés. Un professeur ne peut modifier que les cours dont le champ `proffesseur` correspond à son UUID ; un administrateur peut modifier n’importe quel cours.

Le corps doit contenir au moins un et au plus trois champs parmi :

| Champ | Type | Règle |
|---|---|---|
| `title` | chaîne | Non vide, 200 caractères maximum ; enregistré dans le champ `name` existant. |
| `description` | chaîne | Facultatif, sous réserve d’être fourni dans la requête. |
| `summary` | chaîne | Résumé du cours. |
| `level` | chaîne | Une des valeurs `starter`, `intermedaire` ou `advenced`. |

Les autres champs sont refusés. À chaque modification, `published` est automatiquement remis à `false` : le cours est donc hors ligne et en brouillon jusqu’à une nouvelle publication.

```bash
curl -X PATCH http://localhost:3000/api/test/courses/11111111-1111-4111-8111-111111111111 \
  -H 'Authorization: Bearer <access-token>' \
  -H 'Content-Type: application/json' \
  -d '{"title":"Développement Web — niveau 1","level":"starter"}'
```

Une requête invalide (UUID incorrect, zéro ou plus de trois champs, champ interdit ou niveau inconnu) renvoie `400`. Un utilisateur non authentifié renvoie `401`, un rôle non autorisé ou un professeur non propriétaire renvoie `403`, et un cours inconnu renvoie `404`. Les colonnes `summary` et `level` sont ajoutées par la migration `20261123123000-add-summary-level-to-cours.cjs`.

## 5. Publier un cours

```http
POST /api/courses/:id/publish
```

Exemple :

```bash
curl -X POST http://localhost:3000/api/courses/11111111-1111-4111-8111-111111111111/publish
```

Le champ `published` passe à `true`. Appeler à nouveau la route laisse le cours publié ; l’opération est donc idempotente. Il n’y a actuellement aucune vérification exigeant la présence d’un module ou d’une leçon avant publication. Un cours inconnu renvoie `404`.

La publication ne bloque pas les modifications du cours ni l’ajout de modules ou de leçons dans l’implémentation actuelle.

## 6. Ajouter un module à un cours

```http
POST /api/courses/:id/modules
Content-Type: application/json
```

Corps attendu :

| Champ | Type | Règle |
|---|---|---|
| `name` | chaîne | Non vide. |
| `description` | chaîne | Facultatif. |
| `nombreLecons` | entier | Entier strictement positif. |

Exemple :

```bash
curl -X POST http://localhost:3000/api/courses/11111111-1111-4111-8111-111111111111/modules \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Introduction",
    "description": "Premiers concepts et vocabulaire du cours.",
    "nombreLecons": 4
  }'
```

Le serveur vérifie d’abord que le cours existe, puis ajoute son identifiant au module (`coursId`). Le résultat renvoyé est le module créé. Un cours inconnu provoque `404`.

## 7. Ajouter une leçon à un module

```http
POST /api/courses/modules/:moduleId/lessons
Content-Type: application/json
```

Corps attendu :

| Champ | Type | Règle |
|---|---|---|
| `title` | chaîne | Non vide. |
| `content` | chaîne | Facultatif. |
| `duree` | chaîne | Obligatoire et non vide ; utiliser un format de durée SQL tel que `00:45:00`. |

Exemple :

```bash
curl -X POST http://localhost:3000/api/courses/modules/22222222-2222-4222-8222-222222222222/lessons \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Première page HTML",
    "content": "Créer un document HTML et identifier ses éléments principaux.",
    "duree": "00:45:00"
  }'
```

`title` est enregistré sous le champ `name` du modèle de leçon, et `content` sous `description`. Le `moduleId` provient du chemin, pas du corps. Le serveur vérifie que le module existe ; sinon il renvoie `404`.

## 8. Supprimer un cours

```http
DELETE /api/courses/:id
```

Exemple :

```bash
curl -i -X DELETE http://localhost:3000/api/courses/11111111-1111-4111-8111-111111111111
```

La suppression est autorisée uniquement si `published` vaut `false`. Résultats :

* cours supprimé : `204 No Content` ;
* cours inconnu : `404` ;
* cours déjà publié : `409 CONFLICT`, avec le message `Seuls les brouillons peuvent être supprimés.`

Les associations en base sont configurées en cascade : supprimer un cours supprime aussi ses modules et les leçons rattachées à ces modules. En pratique, la règle « brouillon uniquement » est appliquée avant la suppression.

## Cycle d’utilisation courant

1. Créer un brouillon avec `POST /courses`.
2. Ajouter un ou plusieurs modules avec `POST /courses/:id/modules`.
3. Ajouter les leçons d’un module avec `POST /courses/modules/:moduleId/lessons`.
4. Publier le cours avec `POST /courses/:id/publish`.
5. Consulter ou modifier le cours avec `GET` et `PATCH`.
6. La suppression reste réservée aux cours non publiés.

Exemple de séquence :

```text
POST   /api/courses
POST   /api/courses/{courseId}/modules
POST   /api/courses/modules/{moduleId}/lessons
POST   /api/courses/{courseId}/publish
GET    /api/courses/{courseId}
```

## Modèle de données

Les modèles Sequelize et les migrations définissent les relations suivantes :

```text
Cours 1 ─── * Module 1 ─── * Lecons
```

* `cours.published` est un booléen non nul, initialisé à `false`.
* `cours.category` est un enum non nul (`web`, `data`, `other`), initialisé à `web`.
* `modules.cours_id` référence `cours.id`.
* `lecons.module_id` référence `modules.id`.
* `lecons.duree` est stockée comme une durée SQL `TIME`.
* Les noms de colonnes relationnelles sont en `snake_case`; les propriétés utilisées par le code TypeScript sont `coursId` et `moduleId`.

Le champ `nombreLecons` est fourni lors de la création du module. L’ajout d’une leçon ne l’incrémente pas automatiquement dans l’implémentation actuelle.

Les migrations concernées sont :

* [20261116111215-create-cours.cjs](../migrations/20261116111215-create-cours.cjs)
* [20261117095824-create-modules.cjs](../migrations/20261117095824-create-modules.cjs)
* [20261117095830-create-lecons.cjs](../migrations/20261117095830-create-lecons.cjs)
* [20261118113400-align-course-module-lesson-schema.cjs](../migrations/20261118113400-align-course-module-lesson-schema.cjs), qui aligne une base ayant déjà appliqué les anciennes versions des migrations.
* [20261119120100-add-category-to-cours.cjs](../migrations/20261119120100-add-category-to-cours.cjs), qui ajoute la catégorie enum avec la valeur `web` par défaut.

Pour une base neuve, appliquer les migrations selon la procédure normale du projet :

```bash
npm run db:migrate
npm run db:seed
```

Si une base a déjà enregistré ces migrations avant les changements de schéma, modifier les anciens fichiers ne met pas automatiquement cette base à jour. Il faut alors créer une migration d’évolution adaptée à son état réel avant de la déployer.

## Fichiers concernés

| Fichier | Responsabilité |
|---|---|
| [cours.routes.ts](../src/modules/cours/cours.routes.ts) | Déclare les chemins HTTP et les middlewares de validation. |
| [cours.controller.ts](../src/modules/cours/cours.controller.ts) | Lit les entrées validées et construit les réponses HTTP. |
| [cours.schema.ts](../src/modules/cours/cours.schema.ts) | Valide les paramètres et corps des requêtes. |
| [cours.service.ts](../src/modules/cours/cours.service.ts) | Applique les règles métier et coordonne cours, modules et leçons. |
| [cours.repository.ts](../src/modules/cours/cours.repository.ts) | Effectue les opérations de persistance sur les cours. |
| [cours.models.ts](../src/modules/cours/cours.models.ts) | Décrit le modèle Sequelize `Cours`. |
| [models.ts](../src/database/models.ts) | Initialise les modèles et leurs associations. |
| [cours.service.test.ts](../src/modules/cours/cours.service.test.ts) | Vérifie notamment la suppression des brouillons et les erreurs métier. |

## Vérifications

Les commandes utiles pour vérifier le typage, la compilation et les tests ciblés sont :

```bash
npm run typecheck
npm run build
npx vitest run src/modules/cours/cours.service.test.ts
```
