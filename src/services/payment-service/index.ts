import { unauthorizedError } from "@/errors";
import { findPaymentByTicketId, findTicketById } from "@/repositories/payment-repository";

export async function getPaymentByTicketId (ticketId: number, userId: number) {
    const ticket = await findTicketById(ticketId);
    if(ticket.Enrollment.userId !== userId) throw unauthorizedError;
    return await findPaymentByTicketId(ticketId);
}