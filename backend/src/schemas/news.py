from pydantic import BaseModel
from typing import List, Optional


class Article(BaseModel):
    title: str
    summary: Optional[str] = None


class News(BaseModel):
    news: List[Article]


class TopNewsResponse(BaseModel):
    top_news: List[News]
    language: str
    country: str
