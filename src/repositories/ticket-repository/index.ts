import { prisma } from "@/config";
import { Enrollment, Prisma, Ticket, TicketType } from "@prisma/client";

async function findTicketTypes () {
    return await prisma.ticketType.findMany();
};

async function findTicketTypeByid (ticketTypeId: number) {
    return await prisma.ticketType.findUnique({
        where: {
            id: ticketTypeId
        }
    })
};

async function findUserTickets (userId: number) {
    return await prisma.ticket.findFirst({
        include: {
            TicketType: true
        },
        
        where: {
            Enrollment: {
                User: {
                    id: userId
                }
            }
        }
    });
};

async function findEnrollmentByUserId (userId: number) {
    return await prisma.enrollment.findUnique({
        where: {
            userId
        }
    })
}

async function createTicket (ticketTypeId: number, enrollmentId: number) {
    return await prisma.ticket.create({
        data: {
            enrollmentId,
            ticketTypeId,
            status: 'RESERVED'            
        }
    });
}

const ticketRepository = {
    findTicketTypes,
    findTicketTypeByid,
    findUserTickets,
    findEnrollmentByUserId,
    createTicket
};

export default ticketRepository;