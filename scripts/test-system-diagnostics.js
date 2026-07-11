import {
    getSystemDiagnostics
} from "../src/services/system-diagnostics.service.js";

async function main() {
    console.log("");
    console.log("====================================");
    console.log(" MEDSTACK SYSTEM DIAGNOSTICS TEST");
    console.log("====================================");
    console.log("");

    const diagnostics =
        await getSystemDiagnostics();

    console.log(
        "Status:",
        diagnostics.status
    );

    console.log(
        "Total Checks:",
        diagnostics.summary.total
    );

    console.log(
        "Passed:",
        diagnostics.summary.passed
    );

    console.log(
        "Warnings:",
        diagnostics.summary.warnings
    );

    console.log(
        "Failed:",
        diagnostics.summary.failed
    );

    console.log("");

    for (const check of diagnostics.checks) {
        console.log(
            `${check.name}: ${check.status}`
        );
    }

    console.log("");

    if (diagnostics.summary.failed > 0) {
        throw new Error(
            "Diagnóstico encontrou falhas críticas."
        );
    }

    console.log(
        "SYSTEM DIAGNOSTICS TEST OK"
    );

    console.log("");

    process.exit(0);
}

main().catch((error) => {
    console.error("");
    console.error(
        "SYSTEM DIAGNOSTICS TEST ERROR"
    );

    console.error(error);

    console.error("");

    process.exit(1);
});