import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares";
import httpStatus from "http-status";
import bookingService from "@/services/bookings-service";

export async function getUserBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
    
  try {
    const booking = await bookingService.listUserBooking(userId);
    return res.status(httpStatus.OK).send({
      id: booking.id,
      Room: booking.Room
    });
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;

  try {
    const booking = await bookingService.insertBooking(userId, roomId);
    return res.status(httpStatus.OK).send({ bookingId: booking.id });
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}

export async function putBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const bookingId = Number(req.params.bookingId);
  const { roomId } = req.body;

  try {
    const bookingUpdate = await bookingService.changeBooking(userId, bookingId, roomId);
    return res.status(httpStatus.OK).send({ roomId: bookingUpdate.roomId });
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}
