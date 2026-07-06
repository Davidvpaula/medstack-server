export const WHATSAPP_STATUS = {
    DISCONNECTED: "disconnected",
    STARTING: "starting",
    WAITING_QR: "waiting_qr",
    CONNECTED: "connected",
    RECONNECTING: "reconnecting",
    RESTARTING: "restarting",
    STOPPING: "stopping",
    STOPPED: "stopped",
    ERROR: "error"
};

export const WHATSAPP_STATUS_LABEL = {
    [WHATSAPP_STATUS.DISCONNECTED]: "Desconectado",
    [WHATSAPP_STATUS.STARTING]: "Iniciando",
    [WHATSAPP_STATUS.WAITING_QR]: "Aguardando QR Code",
    [WHATSAPP_STATUS.CONNECTED]: "Conectado",
    [WHATSAPP_STATUS.RECONNECTING]: "Reconectando",
    [WHATSAPP_STATUS.RESTARTING]: "Reiniciando",
    [WHATSAPP_STATUS.STOPPING]: "Parando",
    [WHATSAPP_STATUS.STOPPED]: "Parado",
    [WHATSAPP_STATUS.ERROR]: "Erro"
};