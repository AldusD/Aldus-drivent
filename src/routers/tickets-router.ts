import { insertTicket, sendTicketsTypes, sendUserTickets } from "@/controllers";
import { authenticateToken } from "@/middlewares";
import { Router } from "express";

const ticketsRouter = Router();

const notImplemented: any = (_: any, res: any) => {res.sendStatus(501)}

ticketsRouter
    .all("/*", (authenticateToken))
    .get("/types", sendTicketsTypes)
    .get("/", sendUserTickets)
    .post("/", insertTicket);

export { ticketsRouter };
