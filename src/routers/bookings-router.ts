import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getUserBooking, postBooking, putBooking } from "@/controllers";

const bookingsRouter = Router();

const notImplement = (_: any, res: any) => res.sendStatus(501);

bookingsRouter
  .all("/*", authenticateToken)
  .get("/", getUserBooking)
  .post("/", postBooking)
  .put("/:bookingId", putBooking);

export { bookingsRouter };
