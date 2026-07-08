# Prompt Engineering - NewsFoundry
 
Ce document présente les deux prompts système de l'application (agent de chat et générateur de revue de presse) et **justifie chaque choix de rédaction** en le reliant à une technique de prompt engineering. L'objectif est de montrer que les prompts résultent de décisions délibérées, pensées pour le cas d'usage et pour les particularités d'un système RAG.
 
---
 
## 1. Prompt de l'agent de chat
 
### Prompt actuel
 
```text
Tu es un assistant IA pour pigistes, avec le réflexe d'un journaliste :
curieux, sympathique, à l'aise pour discuter normalement.
 
Cas particulier - demande de news sans sujet précis :
Si l'utilisateur demande les actualités sans préciser de thème, ne fais
pas un inventaire exhaustif en liste. Donne plutôt un aperçu court des
2-3 sujets les plus marquants, en 2-3 phrases, puis propose de creuser
un sujet en particulier si ça l'intéresse.
 
Dans tous les autres cas (question précise, discussion, demande de détail),
réponds normalement et naturellement, avec autant de développement que
la question le mérite - pas besoin d'être artificiellement court.
 
Cadrage :
- Tu es là pour aider sur l'actualité et le travail de pigiste (recherche de sujets,
angles, contexte d'actualité).
- Si l'utilisateur part sur un sujet complètement hors de ce cadre (recette de cuisine,
question perso, etc.), ne cherche pas à répondre quand même en allant chercher des news
vaguement liées au mot-clé : dis simplement, avec le sourire, que c'est hors de ton rayon,
et propose de revenir à l'actualité ou au travail de pigiste. N'utilise pas fetch_news
pour ce genre de demande.
```
 
### Justification des choix
 
**Persona / role prompting** - *« assistant pour pigistes, avec le réflexe d'un journaliste : curieux, sympathique »*
Attribuer un rôle explicite ancre le ton, le registre et le domaine de compétence. Cela rend les réponses cohérentes d'un message à l'autre, là où un assistant sans persona adopte un ton générique et flottant.
 
**Instruction de format conditionnelle** - *cas « news sans sujet précis → aperçu de 2-3 sujets, pas d'inventaire en liste »*
On contrôle explicitement le format de sortie pour un cas d'usage où le comportement par défaut du LLM (tout lister de façon exhaustive) dégraderait l'expérience. L'ajout d'un comportement proactif (« propose de creuser un sujet ») oriente la conversation plutôt que de la clore.
 
**Calibrage de longueur adaptatif** - *« dans tous les autres cas, autant de développement que la question le mérite, pas besoin d'être artificiellement court »*
Ce contre-poids est volontaire : sans lui, l'instruction de brièveté du cas précédent déborderait et rendrait l'agent peu expressif partout. C'est une anticipation d'effet de bord - on borne la consigne de concision à son seul cas d'application.
 
**Garde-fou de périmètre + contrôle d'usage de l'outil** - *« reste sur l'actu / le pigiste, hors sujet → refus poli, n'utilise pas `fetch_news` pour ça »*
Cette instruction porte trois justifications complémentaires :
- **Cohérence produit** : l'application a un but défini, l'agent ne dérive pas hors de son domaine.
- **Économie de crédits API** : on empêche un appel WorldNewsAPI déclenché par un mot-clé vaguement lié (une demande de recette ne doit pas interroger l'API news).
- **Expérience utilisateur** : un refus poli et dans le ton est préférable à une réponse forcée et hors sujet.
---
 
## 2. Prompt du générateur de revue de presse
 
### Prompt actuel
 
```text
Tu es un rédacteur de revue de presse pour un pigiste, avec une vraie plume
journalistique - pas un simple résumé factuel.
 
Thème : {theme}
 
Structure à respecter (reste compact, quitte à être moins exhaustif) :
1. Une accroche en une phrase qui donne le ton du sujet.
2. Le corps : 2 à 4 paragraphes courts, organisés par angle ou sous-thème
(pas juste liste chronologique des articles).
3. Une phrase de conclusion qui ouvre une perspective ou soulève une question.
 
Consignes de style :
- Écris comme un article, pas comme un compte-rendu : varie les formulations,
évite les tournures robotiques du type 'Il est à noter que'.
- Cite tes sources de façon fluide, intégrée à la phrase (pas en liste à part).
- Si le contenu disponible est mince, ne le compense pas en délayant : reste
court et assume une revue brève plutôt que de la remplir artificiellement.
```
 
### Justification des choix
 
**Cadrage par la négative** - *« une vraie plume journalistique, pas un simple résumé factuel »*
Définir par contraste (ce que la sortie ne doit *pas* être) est une technique efficace pour éloigner le modèle de son comportement par défaut, ici le résumé plat et factuel.
 
**Injection dynamique du thème** (`{theme}`)
Le prompt est templatisé : il s'adapte à chaque requête en intégrant le thème demandé. La consigne reste générique et réutilisable, seule la variable change.
 
**Structure de sortie imposée** - *accroche / corps en 2-4 paragraphes par angle / conclusion ouverte*
Double bénéfice : une sortie prévisible et exploitable côté interface, et surtout la précision « organisés par angle ou sous-thème (pas juste liste chronologique) » qui combat un travers classique du LLM en RAG - enfiler les articles un par un au lieu de produire une vraie synthèse.
 
**Priorité de concision explicite** - *« reste compact, quitte à être moins exhaustif »*
On tranche un arbitrage (lisibilité > exhaustivité) au lieu de laisser le modèle décider seul, ce qui produit des sorties de longueur plus homogène.
 
**Exemples négatifs / anti-tics de rédaction** - *« varie les formulations, évite les tournures robotiques du type "Il est à noter que" »*
Fournir un contre-exemple concret est nettement plus efficace qu'une consigne vague du type « écris bien ». C'est un usage ciblé de l'exemple négatif pour neutraliser un tic de langage fréquent des LLM.
 
**Intégration fluide des sources (spécifique RAG)** - *« cite tes sources de façon fluide, intégrée à la phrase »*
Pertinent pour un système RAG : on veut la traçabilité des sources sans casser le rendu éditorial par une liste de références détachée du texte.
 
**Garde anti-hallucination / anti-remplissage** - *« si le contenu est mince, ne délaye pas, assume une revue brève »*
C'est la consigne la plus importante à défendre. En RAG, lorsque le contexte récupéré est pauvre, le risque est que le modèle comble le vide en inventant ou en délayant. Cette instruction réduit ce risque en autorisant explicitement une réponse courte plutôt qu'un remplissage artificiel.
 
---
 
## Limites assumées et pistes d'évolution
 
Deux limites reconnues, qui témoignent d'un recul critique plutôt que d'un angle mort :
 
- **Prompts en dur dans le code** : les deux prompts sont actuellement écrits dans le code applicatif. Une évolution consisterait à les externaliser (fichiers de configuration ou table dédiée) et à les versionner, pour itérer dessus sans redéployer.
- **Absence d'évaluation systématique** : l'efficacité réelle des prompts n'est pas mesurée aujourd'hui. Une évaluation structurée (jeux de tests, comparaison de variantes) permettrait de valider objectivement les choix. Cette piste rejoint l'intégration de MLflow décrite dans [`AMELIORATIONS.md`](./AMELIORATIONS.md).
 