import { forbiddenError, notFoundError } from "@/errors";
import bookingRepository from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { FORBIDDEN } from "http-status";

async function listUserBooking(userId: number) {
  const booking = await bookingRepository.findBookingByUserId(userId);
  if (!booking) {
    throw notFoundError();
  }
  return booking;
}

async function insertBooking(userId: number, roomId: number) {
  const conflict = await bookingRepository.findBookingByUserId(userId);
  if (conflict) {
    throw forbiddenError("User already has a booking");
  }

  await validateTicket(userId);
  await validateRoom(roomId);

  return await bookingRepository.createBooking(userId, roomId);
}

async function changeBooking(userId: number, bookingId: number, roomId: number) {
  const booking = await bookingRepository.findBookingByUserId(userId);
  if (!booking) {
    throw forbiddenError("User does not have a booking yet");
  }
  if (booking.id !== bookingId) {
    throw forbiddenError("Booking id selected do not points to user's booking");
  }
  if (booking.roomId === roomId) {
    throw forbiddenError("the new room shall be different than the previous one");
  }

  await validateRoom(roomId);

  return await bookingRepository.updateBooking(booking.id, roomId);
}

const validateTicket = async (userId: number) => {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw forbiddenError("User does not have a paid ticket valid for booking");
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw forbiddenError("User does not have a paid ticket valid for booking");
  }

  return;
};

const validateRoom = async (roomId: number) => {
  const room = await bookingRepository.findRoomByIdWithBooking(roomId);
  if (!room) {
    throw notFoundError();
  }

  const { Booking, capacity } = room;
  const isRoomFull = capacity <= Booking.length;
  if (isRoomFull) {
    throw forbiddenError(`Room ${roomId} is full`);
  }
    
  return;
};

const bookingService = {
  listUserBooking,
  insertBooking,
  changeBooking
};

export default bookingService;
