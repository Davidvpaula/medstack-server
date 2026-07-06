import { renderWhatsappRuntimeDashboard } from "../services/whatsapp-runtime-dashboard.service.js";

export function runtimeDashboard(req, res) {

    const html =
        renderWhatsappRuntimeDashboard();

    return res.send(html);

}