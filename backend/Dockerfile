FROM ghcr.io/astral-sh/uv:python3.13-bookworm

WORKDIR /app

COPY pyproject.toml uv.lock ./

# Installe uniquement les dépendances pour profiter du cache Docker
RUN uv sync --frozen --no-install-project

# README nécessaire pour build
COPY . .

# Installe le projet lui-même maintenant que tous les fichiers sont présents
RUN uv sync --frozen

RUN chmod +x /app/entrypoint.sh

EXPOSE 8000

ENTRYPOINT [ "/app/entrypoint.sh" ]