from pydantic import BaseModel
from typing import List, Optional


# Top News related
class Article(BaseModel):
    title: str
    summary: Optional[str] = None


class News(BaseModel):
    news: List[Article]


class TopNewsResponse(BaseModel):
    top_news: List[News]
    language: str
    country: str


# Search tool related
class FullArticle(BaseModel):
    title: str
    summary: Optional[str] = None
    url: str


class FullArticleResponse(BaseModel):
    news: List[FullArticle]
    available: int
