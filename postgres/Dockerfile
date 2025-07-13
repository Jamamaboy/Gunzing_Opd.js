FROM postgres:15

# Set locale and collation
ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    LC_COLLATE=C \
    LC_CTYPE=C \
    POSTGRES_INITDB_ARGS="--locale=C --encoding=UTF8"

# Install PostGIS, pgvector dependencies, and build tools in one layer
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

# Copy SQL files
COPY exports/01-init-extensions.sql /docker-entrypoint-initdb.d/01-init-extensions.sql
COPY exports/02-docker_backup.sql /docker-entrypoint-initdb.d/02-docker_backup.sql

# Startup script to ensure pg_hba.conf is set
RUN echo '#!/bin/bash' > /usr/local/bin/start-postgres.sh \
    && echo 'set -e' >> /usr/local/bin/start-postgres.sh \
    && echo 'chown -R postgres:postgres /var/lib/postgresql/data' >> /usr/local/bin/start-postgres.sh \
    && echo 'if ! grep -q "host all all 0.0.0.0/0 trust" /var/lib/postgresql/data/pg_hba.conf; then' >> /usr/local/bin/start-postgres.sh \
    && echo '    echo "host all all 0.0.0.0/0 trust" >> /var/lib/postgresql/data/pg_hba.conf' >> /usr/local/bin/start-postgres.sh \
    && echo 'fi' >> /usr/local/bin/start-postgres.sh \
    && echo 'exec gosu postgres postgres -D /var/lib/postgresql/data' >> /usr/local/bin/start-postgres.sh

RUN chmod +x /usr/local/bin/start-postgres.sh

ENTRYPOINT ["/usr/local/bin/start-postgres.sh"]

EXPOSE 5432

HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
    CMD gosu postgres pg_isready -U postgres -d ai_detection || exit 1

# Final verification (optional, can be removed for smaller image)
RUN echo "=== Final Verification ===" \
    && echo "PostGIS files:" \
    && ls -la /usr/lib/postgresql/15/lib/*postgis* | head -3 \
    && echo "pgvector files:" \
    && ls -la /usr/lib/postgresql/15/lib/vector.so \
    && ls -la /usr/share/postgresql/15/extension/vector.* \
    && echo "Database initialized and ready!" \
    && echo "=== Build complete ==="