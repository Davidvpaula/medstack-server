import {
    runMigrations,
    getMigrationStatus
} from "../src/database/migration-runner.js";

async function main() {
    console.log("");
    console.log("=================================");
    console.log(" MEDSTACK DATABASE MIGRATIONS");
    console.log("=================================");
    console.log("");

    const before = await getMigrationStatus();

    console.log("Status antes:");
    console.log(before);

    const result = await runMigrations();

    console.log("");
    console.log("Resultado:");
    console.log(result);

    const after = await getMigrationStatus();

    console.log("");
    console.log("Status depois:");
    console.log(after);
    console.log("");

    process.exit(0);
}

main().catch((error) => {
    console.error("");
    console.error("Erro ao rodar migrations:");
    console.error(error);
    console.error("");

    process.exit(1);
});