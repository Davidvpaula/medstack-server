import { response } from "../../../core/response.js";

import {
    getWhatsappStatus,
    startWhatsappConnection,
    restartWhatsappConnection
} from "../services/connection.service.js";

import { getWhatsappHealth } from "../services/health.service.js";
import { getWhatsappQr } from "../services/qr.service.js";

import {
    listWhatsappMessages,
    sendWhatsappMessage
} from "../services/message.service.js";

import { sendWhatsAppText } from "../services/whatsapp-send.service.js";
import { getWhatsappRuntime } from "../services/whatsapp-runtime.service.js";

import {
    startWhatsappRuntime,
    restartWhatsappRuntime
} from "../services/whatsapp-runtime-action.service.js";

import {
    bindInstanceToCompany,
    getInstanceCompanyBinding
} from "../services/instance-company-resolver.service.js";

export function status(req, res) {
    return response.success(
        res,
        "Status do WhatsApp carregado.",
        getWhatsappStatus()
    );
}

export function runtime(req, res) {
    return response.success(
        res,
        "Runtime do WhatsApp carregado.",
        getWhatsappRuntime()
    );
}

export function health(req, res) {
    return response.success(
        res,
        "Health do WhatsApp carregado.",
        getWhatsappHealth()
    );
}

export async function start(req, res, next) {
    try {
        const data = await startWhatsappConnection();

        return response.success(
            res,
            "Conexão WhatsApp iniciada.",
            data
        );
    } catch (error) {
        next(error);
    }
}

export async function startRuntime(req, res, next) {
    try {
        const data = await startWhatsappRuntime();

        return response.success(
            res,
            "Runtime WhatsApp iniciado.",
            data
        );
    } catch (error) {
        next(error);
    }
}

export function qr(req, res) {
    return response.success(
        res,
        "QR Code carregado.",
        getWhatsappQr()
    );
}

export function qrPage(req, res) {
    const data = getWhatsappQr();

    const html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8" />
            <meta http-equiv="refresh" content="3" />
            <title>MedStack WhatsApp QR</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background: #f3f4f6;
                    padding: 40px;
                }

                .card {
                    max-width: 520px;
                    background: white;
                    padding: 30px;
                    border-radius: 14px;
                    box-shadow: 0 8px 30px rgba(0,0,0,0.08);
                }

                img {
                    width: 320px;
                    max-width: 100%;
                    margin-top: 20px;
                }

                .status {
                    font-size: 18px;
                    margin-top: 10px;
                }

                a {
                    display: inline-block;
                    margin-top: 18px;
                    color: #2563eb;
                }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>Conectar WhatsApp</h1>

                <p class="status">
                    Status: <strong>${data.status}</strong>
                </p>

                ${
                    data.connected
                        ? "<h2>✅ WhatsApp conectado</h2>"
                        : data.qr
                            ? `<img src="${data.qr}" alt="QR Code WhatsApp" />`
                            : "<p>QR ainda não gerado. Acesse /whatsapp/start-runtime primeiro.</p>"
                }

                <br />

                <a href="/whatsapp/start-runtime">Iniciar runtime</a>
                <br />
                <a href="/whatsapp/start">Iniciar conexão legado</a>
                <br />
                <a href="/whatsapp/restart-runtime">Reiniciar runtime</a>
                <br />
                <a href="/whatsapp/restart">Reiniciar legado</a>
                <br />
                <a href="/whatsapp/status">Ver status JSON</a>
                <br />
                <a href="/whatsapp/health">Ver health JSON</a>
                <br />
                <a href="/whatsapp/runtime">Ver runtime JSON</a>
            </div>
        </body>
        </html>
    `;

    return res.send(html);
}

export async function restart(req, res, next) {
    try {
        const data = await restartWhatsappConnection();

        return response.success(
            res,
            "Conexão WhatsApp reiniciada.",
            data
        );
    } catch (error) {
        next(error);
    }
}

export async function restartRuntime(req, res, next) {
    try {
        const data = await restartWhatsappRuntime();

        return response.success(
            res,
            "Runtime WhatsApp reiniciado.",
            data
        );
    } catch (error) {
        next(error);
    }
}

export function messages(req, res) {
    return response.success(
        res,
        "Mensagens carregadas.",
        listWhatsappMessages()
    );
}

export async function send(req, res, next) {
    try {
        const legacyMessage = await sendWhatsappMessage(req.body);

        return response.success(
            res,
            "Mensagem enviada.",
            legacyMessage
        );
    } catch (error) {
        next(error);
    }
}

export async function sendPipeline(req, res, next) {
    try {
        const result = await sendWhatsAppText(req.body);

        return response.success(
            res,
            "Mensagem enviada pelo pipeline WhatsApp.",
            result
        );
    } catch (error) {
        next(error);
    }
}

export function bindCompany(req, res, next) {
    try {
        const result = bindInstanceToCompany(
            req.params.instanceId,
            req.body.companyId
        );

        return response.success(
            res,
            "Instância vinculada à empresa.",
            result
        );
    } catch (error) {
        next(error);
    }
}

export function showCompanyBinding(req, res) {
    return response.success(
        res,
        "Vínculo da instância carregado.",
        getInstanceCompanyBinding(req.params.instanceId)
    );
}