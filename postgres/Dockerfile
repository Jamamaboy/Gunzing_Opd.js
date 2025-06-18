FROM postgres:15

# Fix locale และ collation issues
ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    LC_COLLATE=C \
    LC_CTYPE=C \
    POSTGRES_INITDB_ARGS="--locale=C --encoding=UTF8"

# ติดตั้ง PostGIS และ pgvector dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
        ca-certificates \
        postgresql-15-postgis-3 \
        postgresql-15-postgis-3-scripts \
        postgresql-server-dev-15 \
        build-essential \
        git \
    && rm -rf /var/lib/apt/lists/*

# ติดตั้ง pgvector
RUN git clone --branch v0.8.0 https://github.com/pgvector/pgvector.git \
    && cd pgvector \
    && make clean \
    && make \
    && make install \
    && cd .. \
    && rm -rf pgvector

# Clean up build dependencies
RUN apt-get remove -y build-essential git \
    && apt-get autoremove -y \
    && apt-get clean

# Copy SQL files เข้า image
COPY exports/01-init-extensions.sql /tmp/01-init-extensions.sql
COPY exports/02-docker_backup.sql /tmp/02-docker_backup.sql

# Initialize PostgreSQL และรัน SQL files ใน build time
RUN set -e \
    && echo "=== Starting PostgreSQL initialization ===" \
    && chown -R postgres:postgres /var/lib/postgresql \
    && su - postgres -c "/usr/lib/postgresql/15/bin/initdb -D /var/lib/postgresql/data --locale=C --encoding=UTF8" \
    && echo "=== Adding pg_hba.conf rule ===" \
    && echo "host all all 0.0.0.0/0 trust" >> /var/lib/postgresql/data/pg_hba.conf \
    && su - postgres -c "/usr/lib/postgresql/15/bin/pg_ctl -D /var/lib/postgresql/data -l /var/lib/postgresql/data/logfile start" \
    && sleep 5 \
    && echo "=== Creating database ===" \
    && su - postgres -c "/usr/lib/postgresql/15/bin/createdb ai_detection" \
    && echo "=== Running SQL files ===" \
    && su - postgres -c "/usr/lib/postgresql/15/bin/psql -d ai_detection -f /tmp/01-init-extensions.sql" \
    && su - postgres -c "/usr/lib/postgresql/15/bin/psql -d ai_detection -f /tmp/02-docker_backup.sql" \
    && echo "=== Verifying setup ===" \
    && su - postgres -c "/usr/lib/postgresql/15/bin/psql -d ai_detection -c '\dx'" \
    && su - postgres -c "/usr/lib/postgresql/15/bin/psql -d ai_detection -c 'SELECT PostGIS_Version();'" \
    && su - postgres -c "/usr/lib/postgresql/15/bin/psql -d ai_detection -c \"CREATE TEMP TABLE test_vec(v vector(3)); INSERT INTO test_vec VALUES ('[1,2,3]'); SELECT v FROM test_vec;\"" \
    && echo "=== Database setup complete! ===" \
    && su - postgres -c "/usr/lib/postgresql/15/bin/pg_ctl -D /var/lib/postgresql/data stop"

# Clean up SQL files
RUN rm -f /tmp/*.sql

# สร้าง startup script ที่มีการแก้ไข pg_hba.conf
RUN echo '#!/bin/bash' > /usr/local/bin/start-postgres.sh \
    && echo 'set -e' >> /usr/local/bin/start-postgres.sh \
    && echo '' >> /usr/local/bin/start-postgres.sh \
    && echo 'echo "Starting PostgreSQL with pre-configured database..."' >> /usr/local/bin/start-postgres.sh \
    && echo '' >> /usr/local/bin/start-postgres.sh \
    && echo '# Set ownership' >> /usr/local/bin/start-postgres.sh \
    && echo 'chown -R postgres:postgres /var/lib/postgresql/data' >> /usr/local/bin/start-postgres.sh \
    && echo '' >> /usr/local/bin/start-postgres.sh \
    && echo '# Add pg_hba.conf rule if not exists' >> /usr/local/bin/start-postgres.sh \
    && echo 'if ! grep -q "host all all 0.0.0.0/0 trust" /var/lib/postgresql/data/pg_hba.conf; then' >> /usr/local/bin/start-postgres.sh \
    && echo '    echo "host all all 0.0.0.0/0 trust" >> /var/lib/postgresql/data/pg_hba.conf' >> /usr/local/bin/start-postgres.sh \
    && echo 'fi' >> /usr/local/bin/start-postgres.sh \
    && echo '' >> /usr/local/bin/start-postgres.sh \
    && echo '# Start PostgreSQL' >> /usr/local/bin/start-postgres.sh \
    && echo 'exec gosu postgres postgres -D /var/lib/postgresql/data' >> /usr/local/bin/start-postgres.sh

RUN chmod +x /usr/local/bin/start-postgres.sh

# Set entrypoint
ENTRYPOINT ["/usr/local/bin/start-postgres.sh"]

# Expose port
EXPOSE 5432

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
    CMD gosu postgres pg_isready -U postgres -d ai_detection || exit 1

# Final verification
RUN echo "=== Final Verification ===" \
    && echo "PostGIS files:" \
    && ls -la /usr/lib/postgresql/15/lib/*postgis* | head -3 \
    && echo "pgvector files:" \
    && ls -la /usr/lib/postgresql/15/lib/vector.so \
    && ls -la /usr/share/postgresql/15/extension/vector.* \
    && echo "Database initialized and ready!" \
    && echo "=== Build complete ==="