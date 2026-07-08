import {
    getMigrationStatus
} from "../src/database/migration-runner.js";

async function main() {
    const status = await getMigrationStatus();

    console.log("");
    console.log("=================================");
    console.log(" MEDSTACK DATABASE STATUS");
    console.log("=================================");
    console.log("");

    console.log(status);

    console.log("");

    process.exit(0);
}

main().catch((error) => {
    console.error("");
    console.error("Erro ao consultar status das migrations:");
    console.error(error);
    console.error("");

    process.exit(1);
});