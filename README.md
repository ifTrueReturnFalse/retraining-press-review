# NewsFoundry - Assistant IA & Revue de Presse pour Pigistes
 
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](#)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](#)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](#)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?logo=python&logoColor=white)](#)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)](#)
[![Mistral AI](https://img.shields.io/badge/Mistral%20AI-FA520F?logo=mistral-ai&logoColor=fff)](#)
[![pnpm](https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=fff)](#)
[![uv](https://img.shields.io/badge/uv-DE5FE9?logo=uv&logoColor=fff)](#)
 
![Status](https://img.shields.io/badge/Status-Finished-green)
![License: MIT](https://img.shields.io/badge/License-MIT-blue)
 
---
 
## 🇫🇷 Version française
 
**NewsFoundry** est une application web full-stack destinée aux **pigistes**, réalisée dans le cadre de mon projet de fin de formation. Elle combine un **assistant conversationnel IA** (persona journaliste) et une fonctionnalité de **génération de revue de presse** à partir d'actualités réelles.
 
Le projet est construit autour d'un agent **PydanticAI + Mistral**, d'une pipeline **RAG** (LlamaIndex + embeddings Mistral, scraping d'articles) et d'une API **FastAPI**, avec un frontend **Next.js**. L'accent a été mis sur la robustesse réseau, la fiabilité des données (Zod côté front, Pydantic côté back) et la sécurité.
 
### Fonctionnalités clés
 
- **Chat IA** : agent journaliste capable de rechercher des actualités en temps réel (WorldNewsAPI) pour enrichir ses réponses.
- **Revue de presse** : génération d'une synthèse thématique par RAG à partir d'articles scrapés, avec réutilisation intelligente des articles déjà chargés dans la conversation.
- **Authentification sécurisée** : JWT en cookie `httpOnly`, mots de passe hashés (bcrypt), isolation stricte des conversations par propriétaire (403/404).
- **Robustesse réseau** : timeout, retry (Tenacity) et gestion des erreurs centralisés sur les appels externes capricieux.
- **Retours utilisateur** : notifications toast (succès/erreur) et copie de la revue en un clic.
### Architecture
 
Monorepo organisé en deux applications :
 
```
newsfoundry/
├── frontend/     # application Next.js / React (voir frontend/README.md)
├── backend/      # API FastAPI + IA (voir backend/README.md)
└── docs/         # documentation technique transverse
```
 
```
Frontend (Next.js) ──► API FastAPI ──► PostgreSQL
                            │
                            ├──► PydanticAI ──► Mistral
                            └──► RAG (LlamaIndex) ──► scraping ──► WorldNewsAPI
```
 
### Stack technique (vue d'ensemble)
 
| Côté | Technologies principales |
|:---|:---|
| Frontend | Next.js, React, TypeScript, Zod, CSS modules, sonner |
| Backend | FastAPI, Python 3.13, SQLAlchemy, Alembic, PydanticAI |
| IA / RAG | Mistral (`mistral-small-latest`), LlamaIndex, MistralAIEmbedding |
| Données | PostgreSQL (Railway) |
| Outils | pnpm, uv, Docker, GitHub Actions |
 
### Documentation
 
La documentation détaillée est répartie ainsi :
 
- 📐 [`docs/BACKEND.md`](./docs/BACKEND.md) - architecture backend, modèle de données, choix d'implémentation
- 🎨 [`docs/FRONTEND.md`](./docs/FRONTEND.md) - architecture frontend, choix d'implémentation
- 🔄 [`docs/FLUX.md`](./docs/FLUX.md) - diagrammes de séquence des parcours (chat, revue de presse, auth)
- 🚀 [`docs/AMELIORATIONS.md`](./docs/AMELIORATIONS.md) - axes d'amélioration et regard critique
 
### Démarrage rapide
 
**Backend** (voir [`backend/README.md`](./backend/README.md) pour le détail)
 
```bash
cd backend
uv run start_db   # conteneur PostgreSQL
uv run api        # API FastAPI
```
 
**Frontend** (voir [`frontend/README.md`](./frontend/README.md) pour le détail)
 
```bash
cd frontend
pnpm install
pnpm dev
```
 
L'application frontend sera accessible sur `http://localhost:3000` (ou le port indiqué dans le terminal).
 
---
 
## 🇬🇧 English Version
 
**NewsFoundry** is a full-stack web application for **freelance journalists**, built as my end-of-training project. It combines an **AI conversational assistant** (journalist persona) with a **press review generation** feature based on real-world news.
 
The project is built around a **PydanticAI + Mistral** agent, a **RAG** pipeline (LlamaIndex + Mistral embeddings, article scraping) and a **FastAPI** backend, with a **Next.js** frontend. Focus was placed on network robustness, data reliability (Zod on the front, Pydantic on the back) and security.
 
### Key Features
 
- **AI Chat**: journalist agent able to search real-time news (WorldNewsAPI) to enrich its answers.
- **Press Review**: thematic synthesis generated via RAG from scraped articles, with smart reuse of articles already loaded in the conversation.
- **Secure Authentication**: JWT in an `httpOnly` cookie, hashed passwords (bcrypt), strict per-owner conversation isolation (403/404).
- **Network Robustness**: centralized timeout, retry (Tenacity) and error handling on flaky external calls.
- **User Feedback**: toast notifications (success/error) and one-click press review copy.
### Architecture
 
Monorepo organized as two applications:
 
```
newsfoundry/
├── frontend/     # Next.js / React app (see frontend/README.md)
├── backend/      # FastAPI + AI backend (see backend/README.md)
└── docs/         # cross-cutting technical documentation
```
 
```
Frontend (Next.js) ──► FastAPI API ──► PostgreSQL
                            │
                            ├──► PydanticAI ──► Mistral
                            └──► RAG (LlamaIndex) ──► scraping ──► WorldNewsAPI
```
 
### Tech Stack (overview)
 
| Side | Main technologies |
|:---|:---|
| Frontend | Next.js, React, TypeScript, Zod, CSS modules, sonner |
| Backend | FastAPI, Python 3.13, SQLAlchemy, Alembic, PydanticAI |
| AI / RAG | Mistral (`mistral-small-latest`), LlamaIndex, MistralAIEmbedding |
| Data | PostgreSQL (Railway) |
| Tooling | pnpm, uv, Docker, GitHub Actions |
 
### Documentation
 
- 📐 [`docs/BACKEND.md`](./docs/BACKEND.md) - backend architecture, data model, implementation choices
- 🎨 [`docs/FRONTEND.md`](./docs/FRONTEND.md) - frontend architecture, implementation choices
- 🔄 [`docs/FLUX.md`](./docs/FLUX.md) - sequence diagrams (chat, press review, auth)
- 🚀 [`docs/AMELIORATIONS.md`](./docs/AMELIORATIONS.md) - improvement roadmap and critical review
### Quick Start
 
**Backend** (see [`backend/README.md`](./backend/README.md))
 
```bash
cd backend
uv run start_db   # PostgreSQL container
uv run api        # FastAPI API
```
 
**Frontend** (see [`frontend/README.md`](./frontend/README.md))
 
```bash
cd frontend
pnpm install
pnpm dev
```
 
The frontend will be available at `http://localhost:3000` (or the port shown in your terminal).