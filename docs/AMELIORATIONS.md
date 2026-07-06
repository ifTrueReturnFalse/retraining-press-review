# Axes d'amélioration - NewsFoundry
 
Ce document formule un regard critique sur la solution actuelle, tant sur la qualité des résultats retournés aux utilisateurs que sur la fluidité des interactions. Chaque piste est justifiée par un constat concret et détaille les grandes lignes de sa mise en œuvre.
 
---
 
## 1. Performance & fiabilité backend
 
### 1.1 `VectorStoreIndex` bloquant
 
**Constat** : la construction de l'index LlamaIndex (`VectorStoreIndex.from_documents`) s'exécute de façon synchrone dans l'event loop FastAPI.
 
**Impact** : pendant la génération d'une revue de presse, l'event loop est bloqué, aucune autre requête (même sur une autre conversation) ne peut être traitée en parallèle. Ça devient critique si deux utilisateurs demandent une revue de presse en même temps.
 
**Piste de solution** : déporter l'appel dans un thread avec `await asyncio.to_thread(VectorStoreIndex.from_documents, documents)`. Ça libère l'event loop sans toucher à la logique métier.
 
**Effort estimé** : faible - changement d'une ligne, déjà identifié.
 
---
 
### 1.2 Concurrence et cache sur les appels API externes
 
**Constat** : chaque revue de presse déclenche des appels à WorldNewsAPI et Mistral sans limite de concurrence ni réutilisation de résultats déjà obtenus.
 
**Impact** : sous charge (plusieurs utilisateurs, ou plusieurs recherches similaires), risque de saturer les rate limits externes et de payer/attendre pour des données déjà récupérées récemment.
 
**Piste de solution** : deux approches possibles, à mettre en balance selon le contexte de production visé.
 
| | **Celery + Redis (queue + cache)** | **Alternative light : `asyncio.Semaphore` + cache Redis simple** |
|---|---|---|
| ✅ Avantages | Découplé, scalable, gère bien la concurrence et la reprise sur erreur, écosystème mature | Rapide à mettre en place, pas de worker séparé à gérer, cohérent avec le reste de la stack async |
| ❌ Inconvénients | Ajoute une brique d'infra (worker Celery, broker), overkill pour le volume actuel du projet | Moins robuste en cas de crash serveur, pas de retry/monitoring intégré comme Celery |
 
**Effort estimé** : moyen - si Celery + Redis, prévoir en plus la conteneurisation du worker.
 
---
 
## 2. Observabilité & mesure
 
### 2.1 MLflow - visibilité sur l'agent
 
**Constat** : aujourd'hui, quand l'agent PydanticAI tourne (appels Mistral, tool calls comme `store_article_urls`, retries), il n'y a pas de trace structurée de ce qui se passe en interne, pas de métriques de temps de réponse, pas d'historique des runs.
 
**Impact** : en cas de comportement inattendu (réponse lente, tool mal appelé, hallucination), impossible de diagnostiquer a posteriori sans rejouer manuellement. Pas de visibilité non plus sur les tendances (le temps de réponse se dégrade-t-il avec des conversations longues ?).
 
**Piste de solution** : deux approches à mettre en balance.
 
| | **MLflow Tracing (autolog PydanticAI/LLM)** | **Logging custom (déjà en place pour WorldNews)** |
|---|---|---|
| ✅ Avantages | UI dédiée, comparaison de runs, métriques de latence/tokens prêtes à l'emploi, standard MLOps reconnu | Zéro dépendance supplémentaire, cohérent avec l'existant |
| ❌ Inconvénients | Ajoute une dépendance + un service à faire tourner (serveur de tracking) + setup | Moins visuel, faut construire soi-même les agrégations/comparaisons |
 
Même une intégration minimale (tracing des appels agent uniquement, pas tout l'écosystème) suffit à démontrer la compétence MLOps.
 
**Effort estimé** : moyen à élevé - `mlflow.pydantic_ai.autolog()` (ou équivalent) + un serveur de tracking local suffisent pour une démo.
 
---
 
### 2.2 Temps de génération des revues de presse
 
**Constat** : pas de mesure actuelle du temps de génération d'une revue de presse (scraping → embedding → RAG → réponse Mistral).
 
**Impact** : sans mesure, impossible de dire si le temps de réponse est acceptable pour l'utilisateur, ni d'identifier le goulot d'étranglement (scraping réseau ? embedding ? génération LLM ?), ni comment ce temps varie selon la longueur de la conversation.
 
**Piste de solution** : ajouter du chronométrage simple à chaque étape de la pipeline (`time.perf_counter()` autour de `call_worldnews_api`, du scraping aiohttp/trafilatura, de l'indexation LlamaIndex, et de la génération finale), logger les durées, puis tester sur quelques cas réels (conversation courte vs longue) pour obtenir des chiffres concrets à présenter. Se combine naturellement avec MLflow si celui-ci est intégré - sinon un simple log suffit.
 
**Effort estimé** : faible - instrumentation ponctuelle, pas de changement d'architecture.
 
---
 
## 3. Expérience utilisateur
 
### 3.1 Streaming des réponses du chat
 
**Constat** : actuellement, le frontend attend la réponse complète de l'agent avant d'afficher quoi que ce soit, l'utilisateur voit un loading Lottie jusqu'à la fin de la génération.
 
**Impact** : sur les réponses longues, l'attente perçue est plus importante que la réalité. La majorité des applications de chat affichent le texte au fur et à mesure, ce qui donne une sensation de réactivité même à temps total identique.
 
**Piste de solution** :
- **Backend** : `StreamingResponse` FastAPI avec un générateur async qui yield les chunks au fur et à mesure que PydanticAI les produit (l'agent supporte le streaming nativement via `agent.run_stream()`).
- **Frontend** : dans `useChatManager`, remplacer l'attente de la réponse complète par une lecture via `ReadableStream`/`fetch` avec `response.body.getReader()`, et afficher le texte progressivement dans le composant de chat.
**Effort estimé** : moyen à élevé - touche le contrat API (`ApiResponse[T]` n'est pas adapté tel quel au streaming, il faudrait un format dédié type Server-Sent Events) et la logique de `useChatManager`. Bon candidat à documenter en détail même sans implémentation avant la soutenance.
 
---
 
### 3.2 Version responsive
 
**Constat** : l'interface est actuellement pensée uniquement pour desktop, sans breakpoints CSS adaptés aux petits écrans.
 
**Impact** : inutilisable sur mobile/tablette, un vrai frein pour des pigistes qui voudraient consulter leurs revues de presse en déplacement.
 
**Piste de solution** : audit des composants clés (chat, modal, revue de presse) avec CSS modules + media queries, en priorisant les vues les plus utilisées plutôt qu'un responsive complet exhaustif.
 
**Effort estimé** : faible à moyen selon le nombre de composants à adapter.
 
---
 
## Synthèse
 
| Piste | Catégorie | Effort |
|---|---|---|
| VectorStoreIndex bloquant | Performance backend | Faible |
| Concurrence & cache (Celery/Redis) | Performance backend | Elevé |
| MLflow | Observabilité | Moyen à élevé |
| Temps de génération des revues | Observabilité | Faible |
| Streaming des réponses | UX | Moyen à élevé |
| Responsive design | UX | Faible à moyen |