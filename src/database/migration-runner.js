import fs from "fs";
import path from "path";

import {
    query,
    transaction
} from "./postgres.client.js";

const MIGRATIONS_DIR = path.resolve("src/database/migrations");

export async function ensureMigrationsTable() {
    await query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
}

export async function getExecutedMigrations() {
    await ensureMigrationsTable();

    const result = await query(`
        SELECT name
        FROM schema_migrations
        ORDER BY name ASC
    `);

    return result.rows.map((row) => row.name);
}

export async function getPendingMigrations() {
    await ensureMigrationsTable();

    const executed = await getExecutedMigrations();
    const files = getMigrationFiles();

    return files.filter((file) => !executed.includes(file));
}

export async function runMigrations() {
    await ensureMigrationsTable();

    const pending = await getPendingMigrations();

    const executed = [];

    for (const file of pending) {
        const filePath = path.join(MIGRATIONS_DIR, file);
        const sql = fs.readFileSync(filePath, "utf-8");

        await transaction(async (client) => {
            await client.query(sql);

            await client.query(
                `
                INSERT INTO schema_migrations (name)
                VALUES ($1)
                `,
                [file]
            );
        });

        executed.push(file);
    }

    return {
        executed,
        pendingBeforeRun: pending.length,
        executedCount: executed.length
    };
}

export async function getMigrationStatus() {
    await ensureMigrationsTable();

    const executed = await getExecutedMigrations();
    const pending = await getPendingMigrations();
    const files = getMigrationFiles();

    return {
        total: files.length,
        executed: executed.length,
        pending: pending.length,
        executedFiles: executed,
        pendingFiles: pending
    };
}

function getMigrationFiles() {
    if (!fs.existsSync(MIGRATIONS_DIR)) {
        return [];
    }

    return fs
        .readdirSync(MIGRATIONS_DIR)
        .filter((file) => file.endsWith(".sql"))
        .sort();
}