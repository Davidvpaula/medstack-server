import { Router } from "express";

import routes from "./routes/conversation.routes.js";

const router = Router();

router.use("/", routes);

export default router;