FROM postgis/postgis:17-3.5

# ติดตั้ง pgvector
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-server-dev-17 \
        build-essential \
        git \
    && git clone --branch v0.8.0 https://github.com/pgvector/pgvector.git \
    && cd pgvector \
    && make \
    && make install

RUN echo "shared_preload_libraries = 'pgvector'" >> /usr/share/postgresql/postgresql.conf.sample