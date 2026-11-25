# API des inscriptions et de la progression

Toutes les routes sont préfixées par `http://localhost:3000/api`. Elles requièrent un jeton Bearer valide et une adresse email vérifiée, sauf indication contraire. Les paramètres `courseId`, `enrollmentId`, `lessonId` et `userId` sont des UUID.

## Routes

| Méthode | Route | Accès | Description |
|---|---|---|---|
| `POST` | `/courses/:courseId/enroll` | Apprenant authentifié et vérifié | Inscrit l’apprenant courant. |
| `GET` | `/courses/:courseId/enrollments` | Enseignant ou admin vérifié | Liste les inscriptions du cours. |
| `POST` | `/courses/:courseId/enrollments` | Enseignant ou admin vérifié | Inscrit un apprenant donné. |
| `GET` | `/enrollments/me` | Utilisateur authentifié et vérifié | Liste les inscriptions de l’utilisateur courant. |
| `GET` | `/learners/top/:rang` | Enseignant ou admin vérifié | Retourne les `rang` apprenants avec le plus d’inscriptions (`rang` de 1 à 10). |
| `GET` | `/students/proffesseur/:idProffesseur` | Professeur connecté concerné | Liste avec pagination ses étudiants et le nombre de ses cours suivis par étudiant. |
| `PUT` | `/enrollments/:enrollmentId/lessons/:lessonId/progress` | Apprenant propriétaire | Crée ou remplace la progression d’une leçon. |

## Règles d’inscription

- Le cours doit exister et être publié.
- L’utilisateur inscrit doit exister, être actif et avoir le rôle `learner`.
- Une même personne ne peut être inscrite deux fois au même cours.
- Le nombre d’inscriptions ne peut pas dépasser `capacite`.
- L’inscription est créée dans une transaction qui verrouille le cours afin d’éviter de dépasser la capacité lors de requêtes simultanées.
- Une inscription déjà présente renvoie `409 CONFLICT`. Un cours non publié ou complet renvoie également `409`.

L’accès `enseignant` permet de consulter la liste et d’inscrire un apprenant, sans vérification de propriété du cours. L’utilisateur de la liste d’inscriptions reçoit les identifiants `user_id` et `cours_id`.

## S’inscrire soi-même à un cours

```bash
curl -X POST http://localhost:3000/api/courses/11111111-1111-4111-8111-111111111111/enroll \
  -H 'Authorization: Bearer <access_token>'
```

Le compte associé au jeton doit avoir le rôle `learner`, être actif et avoir vérifié son adresse email.

## Inscrire un apprenant

```bash
curl -X POST http://localhost:3000/api/courses/11111111-1111-4111-8111-111111111111/enrollments \
  -H 'Authorization: Bearer <teacher_or_admin_access_token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "userId": "22222222-2222-4222-8222-222222222222"
  }'
```

Le corps requiert `userId`, un UUID d’un compte apprenant actif. Le contrôleur ne permet pas de choisir arbitrairement un rôle d’utilisateur.

## Lister les inscrits d’un cours

```bash
curl http://localhost:3000/api/courses/11111111-1111-4111-8111-111111111111/enrollments \
  -H 'Authorization: Bearer <teacher_or_admin_access_token>'
```

## Lister ses inscriptions

```bash
curl http://localhost:3000/api/enrollments/me \
  -H 'Authorization: Bearer <access_token>'
```

La liste personnelle est ordonnée de la plus récente inscription à la plus ancienne.

## Lister les étudiants d’un professeur

```http
GET /api/students/proffesseur/:idProffesseur?page=1&per_page=20
```

Cette route est réservée au compte `teacher` vérifié dont l’UUID correspond à `idProffesseur`. Un professeur ne peut pas consulter la liste d’un autre. La pagination accepte `page` (défaut `1`) et `per_page` (défaut `20`, maximum `100`).

La réponse contient une seule entrée par apprenant inscrit à au moins un cours du professeur. `courses_followed` indique le nombre de cours de ce professeur auxquels cet étudiant est inscrit. Les cours sont associés à leur professeur par l’UUID stocké dans `cours.proffesseur`.

Exemple :

```bash
curl 'http://localhost:3000/api/students/proffesseur/11111111-1111-4111-8111-111111111111?page=1&per_page=20' \
  -H 'Authorization: Bearer <teacher_access_token>'
```

La réponse paginée utilise les métadonnées `page`, `per_page`, `total` et `total_pages` :

```json
{
  "success": true,
  "data": [
    {
      "id": "22222222-2222-4222-8222-222222222222",
      "name": "Awa Diop",
      "email": "awa@example.com",
      "courses_followed": 2
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

## Classement des apprenants

```http
GET /api/learners/top/:rang
```

Cette route est réservée aux comptes `teacher` et `admin` vérifiés. `rang` doit être un entier compris entre `1` et `10`. Les apprenants sont classés par nombre d’inscriptions décroissant ; en cas d’égalité, le nom puis l’identifiant servent à stabiliser l’ordre. Le résultat contient au maximum `rang` entrées avec `name`, `email` et `enrollment_count`.

```bash
curl http://localhost:3000/api/learners/top/3 \
  -H 'Authorization: Bearer <teacher_or_admin_access_token>'
```

Exemple de données :

```json
{
  "success": true,
  "data": [
    {
      "name": "Apprenant Démo",
      "email": "learner@cours-alygne.test",
      "enrollment_count": 4
    }
  ],
  "request_id": "..."
}
```

Une valeur de `rang` hors limites ou non entière renvoie `400 VALIDATION_ERROR`.

## Modifier la progression d’une leçon

```bash
curl -X PUT http://localhost:3000/api/enrollments/33333333-3333-4333-8333-333333333333/lessons/44444444-4444-4444-8444-444444444444/progress \
  -H 'Authorization: Bearer <learner_access_token>' \
  -H 'Content-Type: application/json' \
  -d '{
    "progress": 60
  }'
```

`progress` est un entier compris entre `0` et `100`, bornes incluses. Chaque requête définit la valeur actuelle (elle n’ajoute pas de pourcentage). La progression est sauvegardée par couple inscription/leçon. La leçon doit appartenir au cours de l’inscription, et l’inscription doit appartenir à l’utilisateur connecté.

Exemple de validation rejetée (`400 VALIDATION_ERROR`) :

```json
{
  "progress": 120
}
```

## Enveloppe des réponses

Une création renvoie `201`, une lecture ou mise à jour renvoie `200`. Les succès suivent l’enveloppe générale de l’API :

```json
{
  "success": true,
  "data": {
    "id": "33333333-3333-4333-8333-333333333333",
    "cours_id": "11111111-1111-4111-8111-111111111111",
    "user_id": "22222222-2222-4222-8222-222222222222",
    "date_inscription": "2026-11-18T16:50:00.000Z"
  },
  "request_id": "..."
}
```

Codes d’erreur fréquents :

| HTTP | Code | Cause |
|---:|---|---|
| `400` | `VALIDATION_ERROR` | UUID invalide, corps mal formé ou progression hors de `0–100`. |
| `401` | `UNAUTHORIZED` | Jeton absent, invalide ou expiré. |
| `403` | `FORBIDDEN` ou `EMAIL_NOT_VERIFIED` | Rôle insuffisant, compte non vérifié ou modification de la progression d’un autre utilisateur. |
| `404` | `NOT_FOUND` | Cours, compte, inscription ou leçon introuvable/incompatible. |
| `409` | `CONFLICT` | Cours non publié ou complet, ou inscription en doublon. |

## Migration et données de démonstration

Exécutez les migrations avant d’utiliser ces routes :

```bash
npm run db:migrate
```

Les seeders d’utilisateurs ajoutent trois apprenants de démonstration. Le seeder d’inscriptions enregistre des apprenants sur plusieurs cours pour fournir des résultats de classement, et peut être relancé sans créer de doublons. Les seeders s’exécutent après les migrations et dans l’ordre des fichiers. Pour éviter de relancer les seeders de comptes sur une base existante, vous pouvez lancer uniquement les inscriptions si les utilisateurs et cours de démonstration existent déjà :

```bash
npx sequelize-cli db:seed --seed 20261118163242-demo-inscriptions.cjs
```

La progression est stockée séparément de l’inscription dans `inscription_progressions`, une ligne par leçon et par inscription.
