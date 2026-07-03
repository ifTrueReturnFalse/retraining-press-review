from llama_index.core import Settings, VectorStoreIndex
from llama_index.embeddings.mistralai import MistralAIEmbedding
from llama_index.llms.mistralai import MistralAI
from config import settings as app_settings
from services.scraping_service import scrape_articles
from typing import List
from models.conversations import ConversationModel
import json
from services.news_service import search_news, store_article_urls
from fastapi import HTTPException, status
from exceptions import NewsAPIError


def init_llama_index() -> None:
    """Initializes the global settings for LlamaIndex.

    Sets the embedding model and the language model (LLM) to be used by
    LlamaIndex throughout the application, using API keys from settings.
    """
    Settings.embed_model = MistralAIEmbedding(
        model_name="mistral-embed",
        api_key=app_settings.MISTRAL_API_KEY,
    )

    Settings.llm = MistralAI(
        model="mistral-small-latest",
        api_key=app_settings.MISTRAL_API_KEY,
        timeout=20,
        max_retries=3,
    )


async def build_index(urls: List[str]) -> VectorStoreIndex:
    """Builds a LlamaIndex VectorStoreIndex from a list of article URLs.

    Args:
        urls: A list of URLs to scrape and index.

    Returns:
        A `VectorStoreIndex` instance containing the vectorized article content.
    """
    documents = await scrape_articles(urls)
    return VectorStoreIndex.from_documents(documents)


async def get_urls_for_review(conversation: ConversationModel, theme: str) -> List[str]:
    """Retrieves article URLs for a press review, reusing or fetching as needed.

    This function first checks if the conversation already has at least 3 loaded articles.
    If so, it reuses those. Otherwise, it performs a news search based on the theme,
    stores the found article URLs in the conversation's metadata, and returns them.

    Args:
        conversation: The conversation object, which may contain cached URLs.
        theme: The subject for which to find news articles.

    Returns:
        A list of relevant news article URLs.

    Raises:
        HTTPException: If a search is performed and no articles are found for the theme.
    """
    # Attempt to load previously stored article URLs from the conversation's metadata.
    # The `loaded_articles` field is a JSON string, so it needs to be parsed.
    existing = json.loads(conversation.loaded_articles or "[]")

    # If enough articles are already loaded, reuse them to maintain context.
    if len(existing) >= 3:
        return existing

    try:
        # If fewer than 3 articles are available, perform a new search for articles
        # related to the specified theme using the external news service.
        result = await search_news(theme, "fr", "fr")

    except NewsAPIError as error:
        print(error)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service de news temporairement indisponible",
        ) from error

    url_list = [news.url for news in result.news if news.url]

    # If the news search yields no articles, raise an HTTPException.
    if not url_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aucun article trouvé pour ce thème",
        )

    # Store the newly found article URLs in the conversation's metadata
    # to be reused for subsequent press review requests within the same conversation.
    store_article_urls(url_list, conversation.id)

    return url_list
