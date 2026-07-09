import {
    runDevSeed
} from "../src/database/seeds/dev.seed.js";

async function main() {
    console.log("");
    console.log("=================================");
    console.log(" MEDSTACK DATABASE SEED");
    console.log("=================================");
    console.log("");

    const result = await runDevSeed();

    console.log(result);

    console.log("");
    console.log("Seed executado com sucesso.");
    console.log("");

    process.exit(0);
}

main().catch((error) => {
    console.error("");
    console.error("Erro ao executar seed:");
    console.error(error);
    console.error("");

    process.exit(1);
});
