import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getTicketTypes, getTickets, createTicket } from "@/controllers";

const hotelsRouter = Router();

hotelsRouter
  .all("/*", authenticateToken);

export { hotelsRouter };
