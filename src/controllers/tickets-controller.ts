import { AuthenticatedRequest } from "@/middlewares";
import { getTicketTypes, getUserTickets, postTicket } from "@/services";
import { Response } from "express";
import httpStatus from "http-status";

export async function sendTicketsTypes (req: AuthenticatedRequest, res: Response) {
    try {
        const types = await getTicketTypes();
        return res.status(httpStatus.OK).send(types);
      } catch (error) {
        return res.status(httpStatus.NOT_FOUND).send([]);
    }
}

export async function sendUserTickets (req: AuthenticatedRequest, res: Response) {
  const userId = req.userId;
  
  try {
    const tickets = await getUserTickets(userId)
    return res.status(httpStatus.OK).send(tickets)
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function insertTicket (req: AuthenticatedRequest, res: Response) {
  const userId = req.userId;
  const ticketTypeId = req.body.ticketTypeId;
  if(!ticketTypeId) return res.sendStatus(httpStatus.BAD_REQUEST);

  try {
    const newTicket = await postTicket(ticketTypeId, userId);
    const { id, status, enrollmentId, createdAt, updatedAt } = newTicket.ticket;
    const { ticketType } = newTicket;

    return res.status(httpStatus.CREATED).send({
      id,
      status,
      ticketTypeId,
      enrollmentId,
      TicketType: {
        id: ticketType.id,
        name: ticketType.name,
        price: ticketType.price,
        isRemote: ticketType.isRemote,
        includesHotel: ticketType.includesHotel,
        createdAt: ticketType.createdAt,
        updatedAt: ticketType.updatedAt  
      },
      createdAt, 
      updatedAt
    });
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}