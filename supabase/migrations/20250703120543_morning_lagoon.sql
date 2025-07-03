-- Create database if it doesn't exist
CREATE DATABASE insync_db;

-- Create user if it doesn't exist
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'insync_user') THEN

      CREATE ROLE insync_user LOGIN PASSWORD 'insync_password';
   END IF;
END
$do$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE insync_db TO insync_user;

-- Connect to the database
\c insync_db;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO insync_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO insync_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO insync_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO insync_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO insync_user;