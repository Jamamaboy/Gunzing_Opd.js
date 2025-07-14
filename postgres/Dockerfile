FROM postgres:15

ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    LC_COLLATE=C \
    LC_CTYPE=C \
    POSTGRES_INITDB_ARGS="--locale=C --encoding=UTF8"

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
        ca-certificates \
        postgresql-15-postgis-3 \
        postgresql-15-postgis-3-scripts \
        postgresql-server-dev-15 \
        build-essential \
        git \
    && git clone --branch v0.8.0 https://github.com/pgvector/pgvector.git \
    && cd pgvector \
    && make clean && make && make install \
    && cd .. && rm -rf pgvector \
    && apt-get remove -y build-essential git \
    && apt-get autoremove -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY exports/01-init-extensions.sql /docker-entrypoint-initdb.d/01-init-extensions.sql
COPY exports/02-docker_backup.sql /docker-entrypoint-initdb.d/02-docker_backup.sql

EXPOSE 5432