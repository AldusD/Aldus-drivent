import { prisma } from "@/config";

async function findHotels () {
    return await prisma.hotel.findMany();
}

async function findHotelPaidTicketByUserId (userId: number) {
    return await prisma.ticket.findFirst({
        where: {
            Enrollment: {
                userId
            },
            TicketType: {
                includesHotel: true
            }
        },

        include: {
            Enrollment: true,
            TicketType: true
        }
    })
}

async function findHotelRoomsById (hotelId: number) {
    return await prisma.Room.findMany({
        where: {
            id: hotelId
        }
    });
}

async function findHotelById (hotelId: number) {
    return await prisma.hotel.findFirst({ hotelId });
}

const hotelRepository = {
    findHotelPaidTicketByUserId,
    findHotels,
    findHotelRoomsById,
    findHotelById
};

export default  hotelRepository;