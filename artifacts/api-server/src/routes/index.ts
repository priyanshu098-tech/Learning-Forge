import { Router, type IRouter } from "express";
import healthRouter from "./health";
import generateRouter from "./generate";
import scanRouter from "./scan";

const router: IRouter = Router();

router.use(healthRouter);
router.use(generateRouter);
router.use(scanRouter);

export default router;
