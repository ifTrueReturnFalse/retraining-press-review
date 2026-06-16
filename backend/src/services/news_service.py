import httpx
from config import settings
from schemas.news import TopNewsResponse
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.orm import Session
from database import engine
from models.top_news import TopNewsCache
from datetime import datetime, timedelta, timezone
from fastapi import status, HTTPException


async def fetch_top_news() -> str:
    """
    Fetches the latest top news from the World News API for France in French.

    Returns:
        str: A formatted string containing titles and summaries of the news articles.
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
    """
    Retrieves top news from the local cache if it's fresh (less than 30 minutes old),
    otherwise fetches new data from the API and updates the cache.

    Returns:
        str: The content of the top news to be used in AI prompts.
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
