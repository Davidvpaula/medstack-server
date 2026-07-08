import pg from "pg";

import {
    databaseConfig
} from "../config/database.config.js";

const { Pool } = pg;

let pool = null;

export function getPostgresPool() {
    if (!pool) {
        pool = new Pool({
            connectionString: databaseConfig.url,
            ssl: databaseConfig.ssl
                ? {
                    rejectUnauthorized: false
                }
                : false,
            min: databaseConfig.pool.min,
            max: databaseConfig.pool.max
        });
    }

    return pool;
}

export async function query(text, params = []) {
    const client = getPostgresPool();

    return client.query(text, params);
}

export async function transaction(callback) {
    const client = await getPostgresPool().connect();

    try {
        await client.query("BEGIN");

        const result = await callback(client);

        await client.query("COMMIT");

        return result;
    } catch (error) {
        await client.query("ROLLBACK");

        throw error;
    } finally {
        client.release();
    }
}

export async function testPostgresConnection() {
    const startedAt = Date.now();

    const result = await query("SELECT NOW() as now");

    return {
        connected: true,
        latencyMs: Date.now() - startedAt,
        serverTime: result.rows[0].now
    };
}

export async function closePostgresPool() {
    if (!pool) {
        return {
            closed: false
        };
    }

    await pool.end();

    pool = null;

    return {
        closed: true
    };
}