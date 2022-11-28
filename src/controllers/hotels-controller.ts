import { AuthenticatedRequest } from '@/middlewares';
import { listHotelRooms, listHotels } from '@/services';
import { Response } from 'express';
import httpStatus from 'http-status';

export async function getHotels (req: AuthenticatedRequest, res: Response) {
    const { userId } = req;

    try {
        const hotels = await listHotels(userId);
        return res.status(httpStatus.OK).send(hotels);
    } catch (error) {
        return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
}

export async function getHotelRoomsById (req: AuthenticatedRequest, res: Response) {
    const hotelId = Number(req.params.hotelId);

    try {
        const hotelWithRooms = await listHotelRooms(hotelId);
        return res.status(httpStatus.OK).send(hotelWithRooms);
    } catch (error) {
        return res.sendStatus(httpStatus.UNAUTHORIZED);
    }
}