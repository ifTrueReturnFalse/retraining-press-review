# Flux principaux - NewsFoundry
 
Ce document décrit les parcours de bout en bout de l'application. Chacun traverse le frontend (Next.js) et le backend (FastAPI), d'où un fichier dédié plutôt qu'une répartition entre `FRONTEND.md` et `BACKEND.md`.
 
Les diagrammes sont en [Mermaid](https://mermaid.js.org/), rendus nativement sur GitHub/GitLab.
 
---
 
## 1. Authentification
 
Connexion par email/mot de passe, avec émission d'un JWT stocké en cookie `httpOnly` (jamais accessible au JavaScript client, protection contre le vol de token par XSS).
 
```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant F as Frontend (login)
    participant A as Server action (auth.ts)
    participant API as FastAPI (routers/auth)
    participant DB as PostgreSQL
 
    U->>F: saisit email + mot de passe
    F->>A: server action
    A->>API: POST /auth (credentials)
    API->>DB: recherche user par email (indexé)
    DB-->>API: user + hashed_password
    API->>API: vérification bcrypt
    alt identifiants valides
        API->>API: génération du JWT
        API-->>A: réponse + Set-Cookie (JWT httpOnly)
        A-->>F: succès
        F-->>U: redirection vers l'app
    else identifiants invalides
        API-->>A: 401
        A->>A: safeParse Zod
        A-->>F: erreur
        F-->>U: toast d'erreur (sonner)
    end
```
 
---
 
## 2. Envoi d'un message chat
 
L'agent PydanticAI peut décider d'appeler l'outil `search_news` pour enrichir sa réponse. Les URLs des articles récupérés sont persistées dans `conversation.loaded_articles` (elles serviront de contexte à une éventuelle revue de presse).
 
```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant F as Frontend (useChatManager)
    participant A as Server action (chat.ts)
    participant API as FastAPI (routers/conversations)
    participant AI as ai_service (_run_agent)
    participant M as Mistral (PydanticAI)
    participant W as WorldNewsAPI
 
    U->>F: saisit un message
    F->>A: server action + serverFetch (JWT httpOnly)
    A->>API: requête authentifiée
    API->>API: get_owned_conversation_or_40X (403/404)
    API->>AI: run agent (history_json + message)
    AI->>M: appel de l'agent
    opt L'agent décide de chercher des news
        M-->>AI: tool call search_news
        AI->>W: call_worldnews_api (timeout 30s + retry Tenacity)
        W-->>AI: articles
        AI->>AI: store_article_urls → loaded_articles
        AI->>M: relance avec le contexte
    end
    M-->>AI: réponse finale
    AI-->>API: réponse + history_json mis à jour
    API->>API: persistance (history_json, loaded_articles)
    API-->>A: ApiResponse<T>
    A->>A: safeParse Zod
    A-->>F: résultat validé
    F->>F: parseHistory → Message[]
    F-->>U: affichage
```
 
> En cas d'erreur WorldNewsAPI pendant le chat, l'exception `NewsAPIError` est **absorbée** par l'agent : elle est transformée en message naturel pour le LLM, de sorte que la conversation reste fluide plutôt que de crasher (comportement volontairement différent de la génération de revue - cf. flux 3).
 
---
 
## 3. Génération d'une revue de presse
 
Le point clé est la logique **hybride** de `get_urls_for_review` : la revue réutilise les articles déjà chargés dans la conversation s'il y en a assez (≥ 3), sinon elle déclenche une recherche WorldNews fraîche sur le thème demandé, puis la met en cache dans `loaded_articles`.
 
```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant F as Frontend
    participant A as Server action (pressReviews.ts)
    participant API as FastAPI
    participant PR as press_review_service
    participant W as WorldNewsAPI
    participant S as scraping_service
    participant L as LlamaIndex + MistralEmbedding
    participant M as Mistral
 
    U->>F: clic « générer la revue » (+ thème)
    F->>A: server action (JWT httpOnly)
    A->>API: requête de génération
    API->>API: get_owned_conversation_or_40X (403/404)
    API->>PR: generate(conversation, theme)
 
    Note over PR: get_urls_for_review
    alt ≥ 3 articles déjà dans loaded_articles
        PR->>PR: réutilise les URLs existantes
    else moins de 3 articles
        PR->>W: search_news(theme, fr) via call_worldnews_api
        alt NewsAPIError
            W-->>PR: erreur
            PR-->>API: HTTP 503
        else aucun article trouvé
            W-->>PR: liste vide
            PR-->>API: HTTP 404
        else articles trouvés
            W-->>PR: articles
            PR->>PR: store_article_urls → loaded_articles
        end
    end
 
    PR->>S: build_index → scrape_articles (aiohttp + trafilatura)
    S-->>PR: documents
    PR->>L: VectorStoreIndex.from_documents
    Note over L: ⚠️ appel synchrone bloquant<br/>(cf. AMELIORATIONS.md § 1.1)
    L-->>PR: index
    PR->>M: génération de la revue (RAG, mistral-small-latest)
    M-->>PR: contenu de la revue
    PR-->>API: PressReviewModel persisté (theme, content)
    API-->>A: ApiResponse<T>
    A->>A: safeParse Zod
    A-->>F: résultat validé
    F-->>U: affichage + bouton copier
```
 
**Différence de traitement des erreurs avec le chat** : ici, une `NewsAPIError` est **remontée explicitement en 503** (l'utilisateur doit savoir que la génération a échoué), là où l'agent de chat l'absorbe pour rester conversationnel. Même exception, traitement contextuel différent.
 
---
 
## Configuration LlamaIndex (contexte des flux RAG)
 
Les modèles utilisés par la pipeline RAG sont configurés globalement au démarrage via `init_llama_index()` :
 
- **Embeddings** : `mistral-embed` (MistralAIEmbedding)
- **LLM** : `mistral-small-latest`, avec `timeout=20s`, `max_retries=3`, `max_tokens=2048`
Cette initialisation globale passe par le `lifespan` de FastAPI (cf. `BACKEND.md`) pour éviter le piège du `reload=True` qui n'exécuterait l'init que dans le processus parent.
 