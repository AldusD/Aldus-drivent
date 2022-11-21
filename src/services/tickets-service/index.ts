import { notFoundError } from "@/errors";
import ticketRepository from "@/repositories/ticket-repository";

export async function getTicketTypes () {
    return await ticketRepository.findTicketTypes()
};

export async function getUserTickets (userId: number) {
    const tickets = await ticketRepository.findUserTickets(userId);
    if (!tickets) throw notFoundError();
    return tickets;
}

export async function postTicket (ticketTypeId: number, userId: number) {
    const enrollment = await ticketRepository.findEnrollmentByUserId(userId);
    const ticketType = await ticketRepository.findTicketTypeByid(ticketTypeId); // needed for the response format
    const ticket = await ticketRepository.createTicket(ticketTypeId, enrollment.id);

    return { ticketType, ticket }
}