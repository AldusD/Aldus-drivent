import { prisma } from "@/config";
import { Enrollment, Prisma } from "@prisma/client";

export async function findTicketById (ticketId: number) {
    return await prisma.ticket.findUnique({
        where: {
            id: ticketId 
        },

        include: {
            Enrollment: true
        }
    })
};

export async function findPaymentByTicketId (ticketId: number) {
    return await prisma.payment.findFirst({
        where: {
            ticketId
        }
    })
}