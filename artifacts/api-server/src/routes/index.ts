import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import salonsRouter from "./salons";
import servicesRouter from "./services";
import bookingsRouter from "./bookings";
import reviewsRouter from "./reviews";
import categoriesRouter from "./categories";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(salonsRouter);
router.use(servicesRouter);
router.use(bookingsRouter);
router.use(reviewsRouter);
router.use(categoriesRouter);

export default router;
