import httpx
from config import settings
from schemas.news import TopNewsResponse, FullArticleResponse
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.orm import Session
from database import engine
from models.top_news import TopNewsCache
from models.conversations import ConversationModel
from datetime import datetime, timedelta, timezone
from fastapi import status, HTTPException
from typing import List
import json


async def fetch_top_news() -> str:
    """Fetches and formats top news from the World News API.

    Retrieves the latest top news for France in French and formats them
    into a single string containing titles and summaries.

    Returns:
        A formatted string of news articles, ready for display or use in prompts.

    Raises:
        HTTPException: If the API response is not in the expected format.
    """
    async with httpx.AsyncClient() as client:
        params = {
            "source-country": "fr",
            "language": "fr",
            "api-key": settings.WORLD_NEWS_API_KEY,
            "max-news-per-cluster": 1,
        }

        response = await client.get(
            "https://api.worldnewsapi.com/top-news", params=params
        )

        try:
            validated_response = TopNewsResponse.model_validate(response.json())
        except ValidationError as error:
            print(error)
            raise HTTPException(
                status_code=status.HTTP_406_NOT_ACCEPTABLE,
                detail="Mauvais format de réponse",
            )

        # Extract the first article from each news cluster provided by the API
        articles = [
            cluster.news[0] for cluster in validated_response.top_news if cluster.news
        ]

        # Format the list of articles into a single readable string
        return "\n".join(
            [
                f"- {article.title}: {article.summary or 'Pas de résumé disponible'}"
                for article in articles
                if article.title
            ]
        )


async def get_top_news_for_prompt() -> str:
    """Retrieves top news, using a cache to avoid excessive API calls.

    Checks for a fresh (less than 30 minutes old) cached version of top news.
    If found, it returns the cached content. Otherwise, it fetches new data
    from the API via `fetch_top_news`, updates the cache, and returns the new content.

    Returns:
        The top news content as a formatted string.
    """
    with Session(engine) as session:
        # Retrieve the most recent entry from the cache table
        query = select(TopNewsCache).order_by(TopNewsCache.fetched_at.desc())
        last_cache = session.scalars(query).first()

        if last_cache:
            # Check if the cached data is still valid (TTL of 30 minutes)
            if (
                timedelta(minutes=30)
                > datetime.now(timezone.utc) - last_cache.fetched_at
            ):
                return last_cache.content

        # If cache is empty or expired, trigger a new API call
        news = await fetch_top_news()
        new_cache = TopNewsCache(content=news)

        session.add(new_cache)
        session.commit()

        session.refresh(new_cache)

        return news


async def search_news(
    query: str, source_country: str, language: str
) -> FullArticleResponse:
    """Searches for news articles using specific keywords and filters.

    Args:
        query: The search keywords or text.
        source_country: The ISO 3166 country code for the source.
        language: The ISO 639-1 language code for the articles.

    Returns:
        A validated `FullArticleResponse` object containing the search results.

    Raises:
        HTTPException: If the API response does not match the expected schema.
    """
    async with httpx.AsyncClient() as client:
        # Define search parameters for the World News API
        params = {
            "text": query,
            "source-country": source_country,
            "language": language,
            "sort": "publish-time",
            "sort-direction": "DESC",
            "api-key": settings.WORLD_NEWS_API_KEY,
        }

        response = await client.get(
            "https://api.worldnewsapi.com/search-news", params=params
        )

        try:
            validated_response = FullArticleResponse.model_validate(response.json())
        except ValidationError as error:
            print(error)
            raise HTTPException(
                status_code=status.HTTP_406_NOT_ACCEPTABLE,
                detail="Mauvais format de réponse",
            )

        return validated_response


def store_article_urls(urls: List[str], conversation_id: int):
    """Stores a list of article URLs in a conversation's metadata.

    This allows the application to maintain context of which articles have been
    "seen" or loaded during a chat session, enabling features like contextual
    press reviews.

    Args:
        urls: A list of article URLs to store.
        conversation_id: The ID of the conversation to update.
    """
    with Session(engine) as session:
        # Fetch the specific conversation from the database
        conversation = session.scalars(
            select(ConversationModel).where(ConversationModel.id == conversation_id)
        ).first()

        if not conversation:
            return

        # Deserialize existing URLs, append new ones, and re-serialize to JSON
        # This maintains a persistent list of all articles "seen" in this chat session
        existing = json.loads(conversation.loaded_articles or "[]")
        existing.extend(urls)
        conversation.loaded_articles = json.dumps(existing)
        session.commit()
