## Série d'exercices : parcours `POST /api/auth/register`

Pour chaque réponse, justifier avec les fichiers et fonctions concernés. Les exercices portent sur le parcours complet, de `app.ts` jusqu'à la base de données et aux tests.

1. Donner, dans l'ordre, les middlewares traversés par une requête `POST /api/auth/register`, depuis `app.ts` jusqu'à `AuthController.register`. Distinguer les middlewares globaux des middlewares propres à la route.
   Réponse : authenticate -> createRateLimiter -> identityRateLimitKey -> validateBody -> validateParams -> asyncHandler

2. Pourquoi cette route n'exécute-t-elle pas `authenticate` ? Indiquer où `authenticate` est ajouté au routeur et quelles routes sont concernées.
   Réponse :
    - Le middleware authentificate est utiliser pour valider les authentification et ne sert pas lors du creation de compte
    - 
3. Voici le corps envoyé :
   ```json
   {
     "name": "  Awa Ndiaye  ",
     "email": " AWA@EXEMPLE.COM ",
     "password": "Secret123!",
     "password_confirmation": "Secret123!",
     "role": "admin"
   }
   ```
   Quelles données sont validées et transmises à `AuthService.register` ? Expliquer le traitement du nom, de l'email et du champ `role`.
   Réponse :
   - le champ nom contient des erreur de saisie mais celle ci serat gere par la methode trim()
   - le champ role elle aussi est dejas declarer par defaut et sa valeur est: "learner" de se fait toutes les incriptions seront enregistre avec comme role "learner" et non "admin"
   

4. Quelles règles le mot de passe doit-il respecter ? Que se passe-t-il si le mot de passe ne les respecte pas ou si `password_confirmation` est différent ?
   Réponse :
   - le mot de passe doit etre crypter et envoyer sous forme de hash ce derniers est gere pas jwt


5. Décrire, dans l'ordre, les principales opérations effectuées par `AuthService.register` après validation : création du compte, vérification de l'adresse, émission des jetons et audit.
   Réponse :
   - verification par email, creation du compte et emissions des jetons et audit

6. Quel rôle est réellement attribué au compte dans `AuthService.register` ? Comparer ce comportement à celui attendu par le test d'inscription dans `auth.service.test.ts`. Quelle incohérence constatez-vous et quelle règle métier faudrait-il clarifier ?
   Réponse :
   - le role definit par defaut est "learner"
   - dans le auth.service.test le role n'est pas definit par defaut mais plutot exporter

7. Que se passe-t-il si l'email existe déjà ? Expliquer pourquoi la recherche préalable dans le service ne remplace pas l'index unique en base de données, notamment en cas de deux inscriptions simultanées.
   Réponse :
   - Dans le fichier modes User l'email est declare unique et rdoit aussi respecter certain norme
   - la recherche empeche avoir des doublons et ces dans cette meme logique que le service vas aussi unicite de adress mail

8. Pour le jeton de vérification d'adresse et le jeton de rafraîchissement, distinguer les valeurs retournées ou envoyées à l'utilisateur de celles qui sont enregistrées en base. Où et comment les jetons sont-ils utilisés ?
   Réponse :

9. Décrire la réponse d'une inscription réussie : code HTTP, principales données renvoyées, informations conditionnelles et rôle de `sendSuccess`. Le mot de passe ou son empreinte apparaissent-ils dans l'objet utilisateur renvoyé ?
   Réponse :

10. Si l'envoi du courriel échoue après la création du compte, quelles opérations ont déjà pu être réalisées et quel état partiel peut en résulter ? Proposer un test qui mettrait ce comportement en évidence.
    Réponse :

11. Repérer les protections contre les inscriptions répétées. Indiquer la fenêtre et la limite du rate limiter propre à `/register`, puis expliquer le rôle complémentaire de la contrainte d'unicité sur l'email.
    Réponse :

12. Dans le parcours d'inscription, repérer tout message susceptible d'être écrit dans les logs. Un `console.log` après un `return` peut-il s'exécuter ? Proposer une vérification qui garantit qu'aucun mot de passe ni jeton n'est journalisé.
    Réponse :


Question : clef =  x-request-id-generated : true l'orque le serveur genere UUID et false l'orsque UUID n'est pas genrer par le serveur
Response : 
- Dans le middleware `requestId`, on verifie si l'en-tete `x-request-id` recu contient un UUID valide.
- Si l'en-tete est absent ou invalide, le serveur genere un UUID et renvoie `x-request-id-generated: true`.
- Si l'en-tete contient deja un UUID valide, il est conserve et le serveur renvoie `x-request-id-generated: false`.

```ts*
const candidate = request.header('x-request-id')?.trim()
const generatedByServer = !candidate || !uuidPattern.test(candidate)
const id = generatedByServer ? randomUUID() : candidate

response.setHeader('x-request-id', id)
response.setHeader('x-request-id-generated', String(generatedByServer))
```

//test//
Reponse aux question:
1 => creer un endpoint permetant de modifier partielement un cours par le proffesseur ou admin.
regle metier:
   - endpoint: /api/test/courses/idCours
   - id du cours doit etre un UUID
   - le proffesseur ne peut modifier que ces cours
   - admin peut modifier tout les cours
   - un cours modifier doit automatiquement passer en broulliolns ou horligne
   - minimum un champt doit etre modifier, maximmum 3 champt
   - seul les champt suivant sont modifiable: title, description, summary et level('starter', 'intermedaire', 'advenced')

2 => creer un endpoint pour afficher tout les etudiants qui font le cours d'un proffesseur donnee
regle metier: 
   - endpoint est accessible que par le proffesseur concerner
   - il faut paginer le resultat
   - endpoint: /api/students/proffesseur/idProffesseur
   - dans le resultat afficher en meme temps le nombre de cours du proffesseur que etudiant suit

3 creer un endpoint :
   regle metier: 
   - /api/learners/top/rang le rang doit etre un parametre 
   qui retourne le top rang des etudiants qui suivent le plus de cours
contrainte :
 - rang est un entier positif inferieur ou egal a 10.
 - le resultat doit afficher : le nom de etudiant, email et le nombre de fois inscrit

creer des donner inscriptions dans seeders pour pour pouvoir teser ces fonctionaliter