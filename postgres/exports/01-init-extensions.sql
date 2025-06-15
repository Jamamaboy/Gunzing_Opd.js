-- เปิดใช้งาน extensions ที่จำเป็น
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;

-- ตั้งค่าสำหรับภาษาไทย
ALTER DATABASE raven_db SET client_encoding TO 'UTF8';