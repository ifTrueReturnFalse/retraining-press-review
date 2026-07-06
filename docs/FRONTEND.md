# Architecture Frontend - NewsFoundry
 
## Vue d'ensemble
 
Le frontend est une application **Next.js/React** (déployée sur Vercel) en **TypeScript**, qui consomme l'API FastAPI via des **server actions** authentifiées. L'app propose deux modes principaux : un chat IA avec un agent journaliste, et une fonctionnalité de génération de revue de presse.
 
```
Composants React (UI légère)
        │
        ▼
useChatManager (orchestration centrale : état chat, revue de presse, modals, loading)
        │
        ▼
server actions (serverFetch + safeParse Zod)
        │
        ▼
FastAPI backend (ApiResponse<T>)
```
 
---
 
## Stack technique
 
| Techno | Rôle | Pourquoi ce choix |
|---|---|---|
| Next.js / React | Framework frontend | Server actions natives, vaste choix de librairie |
| TypeScript | Typage statique | Sécurité à la compilation, cohérence avec Zod |
| Zod | Validation runtime | Le typage TS seul ne suffit pas à valider les réponses API à l'exécution |
| CSS modules | Styling | Scoping local sans dépendance à un framework (pas de Tailwind) |
| sonner | Toasts | Léger, API simple pour les retours succès/erreur |
| Lottie (`@lottiefiles/dotlottie-web`) | Animations de chargement | Rendu fluide et léger pour les loaders |
| react-markdown | Rendu du contenu généré | Nécessaire pour afficher proprement les réponses formatées de l'agent/revues de presse |
 
---
 
## Arborescence
 
```
frontend/
├── next.config.ts
├── package.json
├── pnpm-lock.yaml                # gestionnaire de paquets : pnpm
├── pnpm-workspace.yaml
├── tsconfig.json
├── public/
│   └── animations/               # fichiers Lottie (loading, spinner, writing)
└── src/
    ├── actions/                  # server actions Next.js, groupées par feature
    │   ├── auth.ts
    │   ├── chat.ts
    │   └── pressReviews.ts
    ├── app/                      # App Router Next.js
    │   ├── (app)/                # groupe de routes authentifiées (app principale)
    │   ├── (auth)/               # groupe de routes publiques (login)
    │   ├── globals.css
    │   └── layout.tsx
    ├── assets/
    │   └── Icons/                # composants SVG (icônes + mascotte)
    ├── components/               # composants UI, un dossier par composant (+ CSS module)
    │   ├── Buttons/              # BlackButton, SendButton, GenerateReviewButton...
    │   ├── ChatLayout/           # layout principal du chat
    │   ├── ChatMessage/          # rendu d'un message
    │   ├── ChatListItem/         # item de la liste des conversations
    │   ├── Inputs/               # TextInputChat, TextInputWithLabel
    │   ├── Loaders/              # LottieLoader, ReviewLoader
    │   ├── PressReview/          # affichage de la revue de presse
    │   └── Skeletons/            # états de chargement (conversation, message, review)
    ├── hooks/
    │   └── useChatManager.ts     # hook centralisateur de tout l'état front
    ├── models/                   # types métier
    │   ├── authModel.ts
    │   ├── chatModel.ts
    │   ├── pressReviewModel.ts
    │   └── pydanticAiHistory.ts  # format d'historique côté PydanticAI
    ├── schemas/                  # schémas Zod (validation runtime)
    │   ├── apiSchema.ts          # ApiResponse<T> discriminé
    │   ├── authSchemas.ts
    │   ├── chatSchema.ts
    │   └── pressReviewSchema.ts
    ├── services/
    │   └── serverApi.ts          # wrapper serverFetch authentifié
    ├── proxy.ts
    └── utils/
        ├── apiResult.ts          # notifyError, unwrapResult
        ├── httpError.ts          # extractErrorMessage
        ├── parseHistory.ts       # conversion de l'historique de chat
        └── timeUtils.ts
```
 
> Généré avec `tree` (dossiers `node_modules`, `.next` exclus). CSS modules omis ici pour la lisibilité, chaque composant a son `.module.css` à côté de son `.tsx`.
 
---
 
## Choix d'implémentation clés
 
### 1. `useChatManager` - hook centralisateur
 
**Contexte** : le chat et la revue de presse partagent des besoins transverses (état de chargement, gestion des modals, synchronisation avec le backend), avec un risque de dupliquer cette logique dans plusieurs composants.
 
**Décision** : tout l'état et l'orchestration (chat, revue de presse, modal, loading states) sont centralisés dans un unique hook, `useChatManager`. Les composants restent volontairement légers, de la logique minimale, l'essentiel de l'orchestration vit dans le hook.
 
**Alternative envisagée** : répartir l'état localement dans chaque composant, avec du prop drilling ou du contexte React par feature.
 
**Pourquoi ce choix** :
 
| | Hook centralisateur unique | État réparti par composant |
|---|---|---|
| ✅ Avantages | Un seul endroit où comprendre le flux de données, composants réutilisables et testables isolément | Moins de couplage entre features, plus "idiomatique React" par certains standards |
| ❌ Inconvénients | Le hook peut devenir volumineux s'il n'est pas découpé en petites fonctions à responsabilité unique | Risque de duplication de logique (loading states, gestion d'erreur) entre chat et revue de presse |
 
En pratique, le hook est composé de petites fonctions à responsabilité unique, assemblées par un orchestrateur de haut niveau, pas un monolithe.
 
---
 
### 2. Server actions + `serverFetch` + `safeParse` Zod
 
**Contexte** : chaque appel au backend doit être authentifié (JWT en cookie httpOnly) et sa réponse doit être validée avant d'être utilisée par l'UI.
 
**Décision** : les server actions passent systématiquement par un wrapper `serverFetch` (gère l'auth), puis valident la réponse via `safeParse` Zod contre le schéma `ApiResponse<T>` discriminé.
 
**Pourquoi ce choix** : le typage générique TypeScript sur `serverFetch` ne suffit pas, il ne garantit rien à l'exécution. Exemple concret : `z.coerce.date()` n'est appliqué qu'au moment du parse réel, pas à la compilation. Sans `safeParse`, une réponse backend malformée ou un format inattendu pourrait planter silencieusement l'UI plus loin dans le flux.
 
**Organisation** : les server actions sont groupées par feature dans un fichier unique (ex. `chat.ts`), plutôt qu'atomisées action par action, plus simple à naviguer pour une feature donnée.
 
---
 
### 3. Toasts sonner généralisés + utilitaires centralisés
 
**Contexte** : besoin d'un retour utilisateur cohérent (succès/erreur) sur toutes les actions, sans dupliquer la logique d'extraction de message d'erreur partout.
 
**Décision** :
- `notifyError` et `unwrapResult` centralisés dans `utils/apiResult.ts`
- `extractErrorMessage` centralisé dans `utils/httpError.ts`
- Généralisation des toasts sonner sur tous les retours utilisateur (succès et erreur)
**Pourquoi ce choix** : évite la duplication de `try/catch` + extraction de message dans chaque composant ou action → un seul endroit à faire évoluer si le format d'erreur backend change.
 
**Design défensif assumé** : les utilitaires gèrent à la fois les `HTTPException` FastAPI (`{detail: string}`) et les `success: false` manuels du wrapper `ApiResponse`, car le backend peut se comporter de manière inattendue.
 
---
 
### 4. Copier-coller de la revue de presse
 
**Contexte** : besoin utilisateur simple : pouvoir réutiliser rapidement le texte généré ailleurs (email, traitement de texte...).
 
**Décision** : bouton copier presse-papier via `navigator.clipboard.writeText()`, avec confirmation via toast sonner.
 
**Pourquoi ce choix** : API navigateur native, pas de dépendance supplémentaire, feedback immédiat et cohérent avec le système de toasts déjà en place.
 
---
 
### 5. Traduction de l'historique PydanticAI → format UI
 
**Contexte** : le backend persiste l'historique de conversation au format sérialisé de PydanticAI (`history_json`) - une structure riche faite d'entrées `request`/`response`, chacune découpée en `parts` typées (`user-prompt`, `system-prompt`, `text`, `tool-call`, `tool-return`). L'interface de chat, elle, n'a besoin que d'une liste simple de messages `{ role, content, timestamp }`.
 
**Décision** : un type dédié `PydanticAiHistory` (`models/pydanticAiHistory.ts`) modélise fidèlement la structure renvoyée par PydanticAI, et une fonction pure `parseHistory` (`utils/parseHistory.ts`) la convertit en `Message[]` exploitable par l'UI. Elle ne retient que ce qui est affichable : le `user-prompt` des entrées `request`, et le `text` des entrées `response`. Les `tool-call`/`tool-return` (recherches de news internes) sont ignorés pour ne pas polluer l'affichage.
 
**Alternative envisagée** : demander au backend de renvoyer directement un format UI simplifié.
 
**Pourquoi ce choix** :
 
| | Parsing côté frontend | Format simplifié côté backend |
|---|---|---|
| ✅ Avantages | Le backend garde une seule source de vérité (le format natif PydanticAI), pas de transformation métier côté serveur → le front décide de ce qu'il affiche | Frontend plus simple, moins de logique de parsing |
| ❌ Inconvénients | Le front doit connaître la structure interne de PydanticAI et suivre ses évolutions | Le backend doit maintenir un format d'affichage en plus du format natif, duplication de responsabilité |
 
Garder le format PydanticAI comme source unique évite de dénaturer l'historique côté serveur : le même `history_json` sert à la fois à reconstruire le contexte pour l'agent et à alimenter l'UI, chacun en extrayant ce dont il a besoin.
 
---
 
## Petits pièges rencontrés
 
- **Sizing Lottie** : passer par la prop `style` plutôt que des classes CSS pour éviter les conflits de priorité (les classes CSS modules perdent parfois face aux styles inline injectés par la lib Lottie).
- **Zod à l'exécution** : toujours garder en tête que le typage TS générique ne remplace pas un vrai `safeParse`, les coercions (`z.coerce.date()` etc.) ne s'appliquent qu'au parsing réel.
---
 
## Lancer le projet
 
Le projet utilise **pnpm** comme gestionnaire de paquets.
 
```bash
pnpm install
pnpm dev
```
 
Variables d'environnement nécessaires : [.env.example](../frontend/.env.example)

## Tests
 
Aucun test automatisé côté frontend, le périmètre de test du projet portait sur le backend (tests d'autorisation, cf. `BACKEND.md`). La validation du frontend s'appuie sur le typage TypeScript à la compilation et sur `safeParse` Zod à l'exécution pour sécuriser les échanges avec l'API.