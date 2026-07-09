import {
    query
} from "../src/database/postgres.client.js";

import {
    runMigrations
} from "../src/database/migration-runner.js";

import {
    runDevSeed
} from "../src/database/seeds/dev.seed.js";

async function main() {
    console.log("");
    console.log("=================================");
    console.log(" MEDSTACK DATABASE RESET DEV");
    console.log("=================================");
    console.log("");

    console.log("Limpando tabelas...");

    await query(`
        DROP TABLE IF EXISTS messages CASCADE;
        DROP TABLE IF EXISTS conversations CASCADE;
        DROP TABLE IF EXISTS contacts CASCADE;
        DROP TABLE IF EXISTS whatsapp_instances CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
        DROP TABLE IF EXISTS companies CASCADE;
        DROP TABLE IF EXISTS schema_migrations CASCADE;
    `);

    console.log("Rodando migrations...");

    const migrationResult = await runMigrations();

    console.log(migrationResult);

    console.log("Rodando seed...");

    const seedResult = await runDevSeed();

    console.log(seedResult);

    console.log("");
    console.log("Reset DEV concluído.");
    console.log("");

    process.exit(0);
}

main().catch((error) => {
    console.error("");
    console.error("Erro no reset DEV:");
    console.error(error);
    console.error("");

    process.exit(1);
});