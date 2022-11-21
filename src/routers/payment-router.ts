import { getPayment } from "@/controllers";
import { authenticateToken } from "@/middlewares";
import { Router } from "express";

const paymentRouter = Router();

const notImplemented: any = (_: any, res: any) => {res.sendStatus(501)}

paymentRouter
    .all("/*", (authenticateToken))
    .get("/", getPayment)
    .post("/process", notImplemented);

export { paymentRouter };
