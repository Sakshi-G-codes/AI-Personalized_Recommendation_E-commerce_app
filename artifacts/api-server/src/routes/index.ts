import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import productsRouter from "./products";
import recommendationsRouter from "./recommendations";
import cartRouter from "./cart";
import wishlistRouter from "./wishlist";
import ordersRouter from "./orders";
import preferencesRouter from "./preferences";
import vaultRouter from "./vault";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(productsRouter);
router.use(recommendationsRouter);
router.use(cartRouter);
router.use(wishlistRouter);
router.use(ordersRouter);
router.use(preferencesRouter);
router.use(vaultRouter);
router.use(dashboardRouter);

export default router;
