import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import medicinesRouter from "./medicines";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(medicinesRouter);
router.use(dashboardRouter);

export default router;
