# NewsFoundry - Backend
 
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](#)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?logo=python&logoColor=white)](#)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)](#)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?logo=sqlalchemy&logoColor=fff)](#)
[![Mistral AI](https://img.shields.io/badge/Mistral%20AI-FA520F?logo=mistral-ai&logoColor=fff)](#)
[![uv](https://img.shields.io/badge/uv-DE5FE9?logo=uv&logoColor=fff)](#)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=fff)](#)
 
---
 
## 🇫🇷 Version française
 
API **FastAPI** (Python 3.13) de NewsFoundry. Elle expose le chat IA et la génération de revue de presse, et orchestre l'agent PydanticAI + Mistral, la pipeline RAG (LlamaIndex) et les appels à WorldNewsAPI.
 
### Fonctionnalités
 
- **Agent conversationnel** PydanticAI + Mistral, avec outil de recherche d'actualités (WorldNewsAPI).
- **Pipeline RAG** : scraping (aiohttp/trafilatura), indexation vectorielle (LlamaIndex + MistralAIEmbedding), génération de revue de presse.
- **Authentification** JWT (cookie `httpOnly`), hashing bcrypt, isolation des conversations par propriétaire (403/404).
- **Robustesse réseau** centralisée : timeout, retry (Tenacity), gestion des erreurs de format sur WorldNewsAPI.
- **Cache** des top news pour limiter la consommation de crédits API.
### Stack technique
 
| Pile technique | Outil | Rôle |
|:---|:---|:---|
| Langage | Python 3.13 | - |
| Framework API | FastAPI | Async natif, validation Pydantic intégrée |
| ORM & migrations | SQLAlchemy + Alembic | Accès données typé, migrations versionnées |
| Agent IA | PydanticAI | Orchestration de l'agent, réponses typées |
| RAG | LlamaIndex + MistralAIEmbedding | Indexation vectorielle et recherche sémantique |
| LLM | Mistral (`mistral-small-latest`) | Génération des réponses et revues |
| Robustesse | Tenacity | Retry sur les appels réseau |
| Base de données | PostgreSQL (Railway) | Persistance |
| Gestionnaire de paquets | uv | Gestion rapide des dépendances |
| Conteneurisation | Docker | Reproductibilité dev/prod |
 
### Installation & utilisation
 
> [!IMPORTANT]
> Ce projet utilise [uv](https://docs.astral.sh/uv/) pour la gestion des dépendances et des scripts.
 
**En développement**
 
```bash
uv run start_db   # démarre un conteneur PostgreSQL
uv run api        # lance l'API FastAPI
```
 
**En production (Docker)**
 
Le conteneur est piloté par `entrypoint.sh`, qui enchaîne migrations → initialisation DB → démarrage de l'API (`set -e` : arrêt immédiat si une étape échoue).
 
```bash
docker build -t newsfoundry-api .
docker run --env-file .env newsfoundry-api
```
 
Variables d'environnement nécessaires : [`.env.example`](.env.example)
 
### Tests
 
```bash
uv run pytest
```
 
CI : GitHub Actions sur `ubuntu-latest` avec `uv`, incluant les tests d'autorisation (accès nominal + non autorisé).
 
### Points techniques & conception
 
- **`ApiResponse[T]`** : wrapper de réponse générique et discriminé, contrat unique consommé côté front.
- **Centralisation réseau** (`call_worldnews_api`) : timeout, retry et erreurs de format gérés en un seul endroit.
- **Propagation contextuelle des erreurs** : une même `NewsAPIError` est absorbée par l'agent (chat fluide) mais remontée en 503 par le service de revue.
- **Sécurité factorisée** (`get_owned_conversation_or_40X`) : vérification de propriété centralisée et testée.

📖 Détail complet dans [`docs/BACKEND.md`](../docs/BACKEND.md), parcours dans [`docs/FLUX.md`](../docs/FLUX.md), pistes d'évolution dans [`docs/AMELIORATIONS.md`](../docs/AMELIORATIONS.md).
 
---
 
## 🇬🇧 English Version
 
NewsFoundry's **FastAPI** (Python 3.13) backend. It exposes the AI chat and press review generation, and orchestrates the PydanticAI + Mistral agent, the RAG pipeline (LlamaIndex) and WorldNewsAPI calls.
 
### Features
 
- **Conversational agent** (PydanticAI + Mistral) with a news search tool (WorldNewsAPI).
- **RAG pipeline**: scraping (aiohttp/trafilatura), vector indexing (LlamaIndex + MistralAIEmbedding), press review generation.
- **Authentication**: JWT (`httpOnly` cookie), bcrypt hashing, per-owner conversation isolation (403/404).
- **Centralized network robustness**: timeout, retry (Tenacity), format-error handling on WorldNewsAPI.
- **Caching** of top news to limit API credit consumption.
### Tech Stack
 
| Stack | Tool | Role |
|:---|:---|:---|
| Language | Python 3.13 | - |
| API Framework | FastAPI | Native async, built-in Pydantic validation |
| ORM & migrations | SQLAlchemy + Alembic | Typed data access, versioned migrations |
| AI Agent | PydanticAI | Agent orchestration, typed responses |
| RAG | LlamaIndex + MistralAIEmbedding | Vector indexing and semantic search |
| LLM | Mistral (`mistral-small-latest`) | Answer and review generation |
| Robustness | Tenacity | Retry on network calls |
| Database | PostgreSQL (Railway) | Persistence |
| Package Manager | uv | Fast dependency management |
| Containerization | Docker | Dev/prod reproducibility |
 
### Installation & Usage
 
> [!IMPORTANT]
> This project uses [uv](https://docs.astral.sh/uv/) for dependency and script management.
 
**Development**
 
```bash
uv run start_db   # starts a PostgreSQL container
uv run api        # launches the FastAPI API
```
 
**Production (Docker)**
 
The container is driven by `entrypoint.sh`, which chains migrations → DB init → API start (`set -e`: aborts immediately if a step fails).
 
```bash
docker build -t newsfoundry-api .
docker run --env-file .env -p 8000:8000 newsfoundry-api
```
 
Required environment variables: [`.env.example`](.env.example)
 
### Tests
 
```bash
uv run pytest
```
 
CI: GitHub Actions on `ubuntu-latest` with `uv`, including authorization tests (nominal + unauthorized access).
 
### Technical Highlights & Design
 
- **`ApiResponse[T]`**: generic, discriminated response wrapper - a single contract consumed by the frontend.
- **Network centralization** (`call_worldnews_api`): timeout, retry and format errors handled in one place.
- **Contextual error propagation**: the same `NewsAPIError` is absorbed by the agent (smooth chat) but surfaced as 503 by the press review service.
- **Factored security** (`get_owned_conversation_or_40X`): centralized, tested ownership check.
📖 Full details in [`docs/BACKEND.md`](../docs/BACKEND.md), flows in [`docs/FLUX.md`](../docs/FLUX.md), roadmap in [`docs/AMELIORATIONS.md`](../docs/AMELIORATIONS.md).