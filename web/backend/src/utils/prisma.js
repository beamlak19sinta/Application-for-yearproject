const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

// Manually load .env for stability
const envPath = path.join(__dirname, '../../.env');
const envData = fs.readFileSync(envPath, 'utf8');
const envVars = Object.fromEntries(
    envData.split('\n')
        .filter(line => line && !line.startsWith('#'))
        .map(line => line.split('=').map(s => s.trim().replace(/^"|"$/g, '')))
);

// Prisma 7 recommended pattern: using driver adapter
const pool = new Pool({ connectionString: envVars.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
