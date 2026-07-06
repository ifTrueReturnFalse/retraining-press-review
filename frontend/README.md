# NewsFoundry - Frontend
 
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](#)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](#)
[![Zod](https://img.shields.io/badge/Zod-3E67B1?logo=zod&logoColor=fff)](#)
[![pnpm](https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=fff)](#)
 
---
 
## 🇫🇷 Version française
 
Frontend **Next.js / React** (TypeScript) de NewsFoundry, déployé sur Vercel. Il consomme l'API FastAPI via des **server actions** authentifiées et propose deux modes : un chat IA et la génération de revue de presse.
 
### Fonctionnalités
 
- **Interface de chat** avec historique de conversation et rendu Markdown des réponses de l'agent.
- **Revue de presse** : affichage du contenu généré + copie presse-papier en un clic.
- **Validation runtime** systématique des réponses API via Zod (`safeParse`).
- **Retours utilisateur** cohérents via toasts (sonner) et loaders Lottie.
### Stack technique
 
| Pile technique | Outil | Rôle |
|:---|:---|:---|
| Langage | TypeScript | Typage statique pour un code robuste et maintenable |
| Framework | Next.js / React | Construction de l'UI, server actions, rendu hybride |
| Validation | Zod | Validation stricte des données à l'exécution (`safeParse`) |
| Styling | CSS modules | Scoping local, sans framework CSS (pas de Tailwind) |
| Notifications | sonner | Retours toast succès/erreur |
| Animations | Lottie | Loaders animés légers |
| Gestionnaire de paquets | pnpm | Gestion rapide et efficace des dépendances |
 
### Installation & utilisation
 
> [!IMPORTANT]
> Ce projet nécessite le [backend NewsFoundry](../backend/README.md) en fonctionnement.
> Il utilise [pnpm](https://pnpm.io/) pour la gestion des dépendances, assure-toi de l'avoir installé.
 
1. Installer les dépendances
```bash
pnpm install
```
 
2. Lancer l'application
```bash
pnpm dev
```
 
L'application sera accessible à l'adresse `http://localhost:3000` (ou le port indiqué dans le terminal).
 
Variables d'environnement nécessaires : [`.env.example`](.env.example)
 
### Points techniques & conception
 
- **`useChatManager`** : hook centralisateur de tout l'état front (chat, revue, modales, loading), qui garde les composants légers.
- **Server actions + `safeParse` Zod** : chaque appel backend est authentifié (`serverFetch`) puis validé à l'exécution, le typage TypeScript seul ne garantissant rien au runtime.
- **Traduction de l'historique PydanticAI** : `parseHistory` convertit le format riche renvoyé par l'agent en messages simples pour l'UI.

📖 Détail complet dans [`docs/FRONTEND.md`](../docs/FRONTEND.md) et les parcours dans [`docs/FLUX.md`](../docs/FLUX.md).
 
---
 
## 🇬🇧 English Version
 
NewsFoundry's **Next.js / React** (TypeScript) frontend, deployed on Vercel. It consumes the FastAPI backend through authenticated **server actions** and offers two modes: an AI chat and press review generation.
 
### Features
 
- **Chat interface** with conversation history and Markdown rendering of the agent's answers.
- **Press review**: displays generated content + one-click clipboard copy.
- **Runtime validation** of all API responses via Zod (`safeParse`).
- **Consistent user feedback** through toasts (sonner) and Lottie loaders.
### Tech Stack
 
| Stack | Tool | Role |
|:---|:---|:---|
| Language | TypeScript | Static typing for robust, maintainable code |
| Framework | Next.js / React | UI construction, server actions, hybrid rendering |
| Validation | Zod | Strict runtime validation (`safeParse`) |
| Styling | CSS modules | Local scoping, no CSS framework (no Tailwind) |
| Notifications | sonner | Success/error toast feedback |
| Animations | Lottie | Lightweight animated loaders |
| Package Manager | pnpm | Fast and efficient dependency management |
 
### Installation & Usage
 
> [!IMPORTANT]
> This project requires the [NewsFoundry backend](../backend/README.md) to be running.
> It uses [pnpm](https://pnpm.io/) for dependency management, make sure it is installed.
 
1. Install dependencies
```bash
pnpm install
```
 
2. Launch the application
```bash
pnpm dev
```
 
The application will be available at `http://localhost:3000` (or the port shown in your terminal).
 
Required environment variables: [`.env.example`](.env.example)
 
### Technical Highlights & Design
 
- **`useChatManager`**: central hook holding all frontend state (chat, review, modals, loading), keeping components lightweight.
- **Server actions + Zod `safeParse`**: every backend call is authenticated (`serverFetch`) then validated at runtime, TypeScript typing alone guarantees nothing at runtime.
- **PydanticAI history translation**: `parseHistory` converts the rich format returned by the agent into simple UI messages.

📖 Full details in [`docs/FRONTEND.md`](../docs/FRONTEND.md) and flows in [`docs/FLUX.md`](../docs/FLUX.md).