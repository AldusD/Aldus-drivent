import { prisma } from "@/config";

async function findBookingByUserId(userId: number) {
  return await prisma.booking.findFirst({
    where: {
      userId
    },

    include: {
      Room: true
    }
  });
}

async function findRoomByIdWithBooking(roomId: number) {
  return await prisma.room.findUnique({
    where: {
      id: roomId
    },

    include: {
      Booking: true
    }
  });
}

async function createBooking(userId: number, roomId: number) {
  return await prisma.booking.create({
    data: {
      userId,
      roomId
    }
  });
}

async function updateBooking(bookingId: number, roomId: number) {
  return await prisma.booking.update({
    where: {
      id: bookingId
    },

    data: {
      roomId
    }
  });
}

const bookingRepository = {
  findBookingByUserId,
  findRoomByIdWithBooking,
  createBooking,
  updateBooking
};

export default bookingRepository;
