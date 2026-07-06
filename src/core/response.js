export const response = {
    success(res, message, data = null, status = 200) {
        return res.status(status).json({
            success: true,
            message,
            data
        });
    },

    error(res, message, status = 500) {
        return res.status(status).json({
            success: false,
            message,
            data: null
        });
    }
};