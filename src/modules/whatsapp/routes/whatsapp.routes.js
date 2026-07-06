import { Router } from "express";

import {
    status,
    runtime,
    health,
    start,
    startRuntime,
    qr,
    qrPage,
    restart,
    restartRuntime,
    messages,
    send,
    sendPipeline,
    dispatchText,
    dispatchQueue,
    retryDispatchJob,
    clearDispatchQueue,
    clearLogs,
    bindCompany,
    showCompanyBinding
} from "../controllers/whatsapp.controller.js";

import {
    runtimeDashboard
} from "../controllers/whatsapp-runtime-dashboard.controller.js";

import {
    simulateIncoming,
    simulateOutgoing
} from "../controllers/whatsapp-message-handler.controller.js";

import {
    simulateAck
} from "../controllers/whatsapp-ack.controller.js";

const router = Router();

router.get("/status", status);
router.get("/runtime", runtime);
router.get("/dashboard", runtimeDashboard);
router.get("/health", health);

router.get("/start", start);
router.post("/start", start);

router.get("/start-runtime", startRuntime);
router.post("/start-runtime", startRuntime);

router.get("/qr", qr);
router.get("/qr-page", qrPage);

router.get("/restart", restart);
router.post("/restart", restart);

router.get("/restart-runtime", restartRuntime);
router.post("/restart-runtime", restartRuntime);

router.get("/messages", messages);

router.post("/send", send);
router.post("/send-pipeline", sendPipeline);

router.post("/dispatch", dispatchText);
router.get("/dispatch", dispatchQueue);
router.post("/dispatch/:jobId/retry", retryDispatchJob);
router.post("/dispatch/clear", clearDispatchQueue);

router.post("/logs/clear", clearLogs);

router.get("/instance/:instanceId/company", showCompanyBinding);
router.post("/instance/:instanceId/company", bindCompany);

router.post("/simulate/incoming", simulateIncoming);
router.post("/simulate/outgoing", simulateOutgoing);
router.post("/simulate/ack", simulateAck);

export default router;