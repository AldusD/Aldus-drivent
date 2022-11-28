import { notFoundError, unauthorizedError } from "@/errors";
import hotelRepository from "@/repositories/hotel-repository";

export async function listHotels (userId: number) {
    const hasPaidTicket = await verifyHotelPaidTicket(userId);
    if(!hasPaidTicket) {
        throw unauthorizedError();
    }
    
    return await hotelRepository.findHotels();
}

async function verifyHotelPaidTicket (userId: number) {
    const hotelPaidTicket = await hotelRepository.findHotelPaidTicketByUserId(userId);
    
    if(!hotelPaidTicket) {
        return false;
    }
    return true;
}

export async function listHotelRooms (hotelId: number) {
    const hotel = await hotelRepository.findHotelById(hotelId);
    const rooms = await hotelRepository.findHotelRoomsById(hotelId);

    return {
        id: hotel.id,
        name: hotel.name,
        image: hotel.image,
        createdAt: hotel.createdAt,
        updatedAt: hotel.updatedAt,
        rooms
    };
}