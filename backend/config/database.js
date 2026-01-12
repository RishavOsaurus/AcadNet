import { Sequelize } from 'sequelize';

// Use DATABASE_URL if available (for production) or construct from individual env vars
const connectionString = process.env.DATABASE_URL || null;

// Determine whether SSL is required (Neon uses `sslmode=require` in the URL)
const requiresSsl = Boolean(
  connectionString?.includes('sslmode=require') || process.env.PG_SSL === 'true'
);

const baseOptions = {
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT || 5432,
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

if (requiresSsl) {
  // For cloud Postgres providers like Neon, pass SSL options to the pg driver.
  baseOptions.dialectOptions = {
    ssl: {
      require: true,
      // For many managed DBs the server certificate isn't verifiable in container images;
      // `rejectUnauthorized: false` allows the connection. If you can provide CA cert,
      // remove this and set a proper cert.
      rejectUnauthorized: false
    }
  };
}

const sequelize = connectionString
  ? new Sequelize(connectionString, baseOptions)
  : new Sequelize(
      process.env.PG_DATABASE || 'acadnet',
      process.env.PG_USER || 'postgres',
      process.env.PG_PASSWORD || 'password',
      baseOptions
    );

export default sequelize;
