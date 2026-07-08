import { response } from "../core/response.js";

import {
    getDatabaseDashboard
} from "../database/database-dashboard.service.js";

export async function dashboard(req, res, next) {

    try {

        return response.success(

            res,

            "Dashboard do banco carregado.",

            await getDatabaseDashboard()

        );

    }

    catch (error) {

        next(error);

    }

}