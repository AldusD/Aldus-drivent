import { AuthenticatedRequest } from "@/middlewares";
import { getPaymentByTicketId } from "@/services";
import { Request, Response } from "express";
import httpStatus from "http-status";

export async function getPayment(req: AuthenticatedRequest, res: Response) {
    const ticketId = Number(req.query.ticketId);
    if(!ticketId) return res.sendStatus(httpStatus.BAD_REQUEST);
    const userId = req.userId;

    try {
        const payment = await getPaymentByTicketId(ticketId, userId);
        return res.status(httpStatus.OK).send(payment);
    } catch (error) {
    
    }
}
