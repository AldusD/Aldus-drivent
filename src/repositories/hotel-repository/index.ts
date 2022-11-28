import { prisma } from "@/config";
import { TicketStatus } from "@prisma/client";

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
            },
            status: TicketStatus.PAID            
        },

        include: {
            Enrollment: true,
            TicketType: true,
        }
    })
}

async function findHotelRoomsById (hotelId: number) {
    return await prisma.room.findMany({
        where: {
            hotelId
        }
    });
}

async function findHotelById (hotelId: number) {
    return await prisma.hotel.findFirst({ 
        where: {
            id: hotelId
        }
    });
}

const hotelRepository = {
    findHotelPaidTicketByUserId,
    findHotels,
    findHotelRoomsById,
    findHotelById
};

export default  hotelRepository;