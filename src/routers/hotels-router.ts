import { Router, Response } from "express";
import { authenticateToken } from "@/middlewares";
import { getHotelRoomsById, getHotels } from "@/controllers";

const hotelsRouter = Router();

const notImplemented = (_: any, res: Response) => { res.sendStatus(501) };

hotelsRouter
  .all("/*", authenticateToken)
  .get("/", getHotels)
  .get("/:hotelId", getHotelRoomsById);
  
export { hotelsRouter };
