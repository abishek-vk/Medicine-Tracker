import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import medicinesRouter from "./medicines";
import dashboardRouter from "./dashboard";
import { authMiddleware } from "../middlewares/auth";

const router: IRouter = Router();

// Public routes — no auth required
router.use(healthRouter);
router.use(authRouter);

// Protected routes — require a valid JWT
router.use(authMiddleware, medicinesRouter);
router.use(authMiddleware, dashboardRouter);

export default router;
