import { Router, Response } from "express";
import { authenticateToken } from "@/middlewares";
import { getHotels } from "@/controllers";

const hotelsRouter = Router();

const notImplemented = (_: any, res: Response) => { res.sendStatus(501) };

hotelsRouter
  .all("/*", authenticateToken)
  .get("/", getHotels)
  .get("/:hotelId", notImplemented);
  
export { hotelsRouter };
