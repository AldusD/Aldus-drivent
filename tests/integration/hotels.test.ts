import app, { init } from "@/app";
import { prisma } from "@/config";
import { createEnrollmentWithAddress, createUser, createTicket, createTicketTypeByInputs } from "../factories";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import { cleanDb, generateValidToken } from "../helpers";
import { TicketStatus } from "@prisma/client";
import { createHotel, createRoom } from "../factories/hotels-factory";

beforeAll(async () => {
    await init();
    await cleanDb();
  });

afterEach(async () => {
    await cleanDb();
  })

  const server = supertest(app);

  describe("GET /hotels", () => {
    it("should respond with status 401 if no token is given", async () => {
      const response = await server.get("/hotels");
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if given token is not valid", async () => {
      const token = faker.lorem.word();
  
      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if there is no session for given token", async () => {
      const userWithoutSession = await createUser(); 
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
  
      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if there is no ticket", async () => {
        const token = await generateValidToken();

        const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if there is no hotel included ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const noHotelTicketType = await createTicketTypeByInputs(undefined, undefined, undefined, false);
      const ticket = await createTicket(enrollment.id, noHotelTicketType.id, TicketStatus.PAID);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

    it("should respond with status 401 if there is no paid hotel included ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const noHotelTicketType = await createTicketTypeByInputs(undefined, undefined, undefined, true);
      const ticket = await createTicket(enrollment.id, noHotelTicketType.id, TicketStatus.RESERVED);
  
      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

    it("should respond with status 200 and an empty array if no hotels", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const noHotelTicketType = await createTicketTypeByInputs(undefined, undefined, undefined, true);
      const ticket = await createTicket(enrollment.id, noHotelTicketType.id, TicketStatus.PAID);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual([])
  });

    it("should respond with status 200 and with existent hotel data", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const noHotelTicketType = await createTicketTypeByInputs(undefined, undefined, undefined, true);
      const ticket = await createTicket(enrollment.id, noHotelTicketType.id, TicketStatus.PAID);
      
      const hotel = await createHotel();

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual([
        {
          updatedAt: hotel.updatedAt.toISOString(),
          createdAt: hotel.createdAt.toISOString(),
          id: hotel.id,
          name: hotel.name,
          image: hotel.image
        }
      ])
  });

    describe("GET /hotels/:hotelId", () => {
      it("should respond with status 401 if no token is given", async () => {
        
        const hotelId = faker.datatype.number.toString();
        const response = await server.get(`/hotels/${hotelId}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
  
      it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();
        const hotelId = faker.datatype.number.toString();
    
        const response = await server.get(`/hotels/${hotelId}`).set("Authorization", `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });
  
      it("should respond with status 401 if there is no session for given token", async () => {
        const userWithoutSession = await createUser(); 
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
        const hotelId = faker.datatype.number.toString();

        const response = await server.get(`/hotels/${hotelId}`).set("Authorization", `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      });

      it("should respond with status 401 if hotel id does not correspond to any hotel", async () => {
        const token = generateValidToken();
        const hotelId = '0';
    
        const response = await server.get(`/hotels/${hotelId}`).set("Authorization", `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
      })

      it("should respond with status 200 and an empty array in 'rooms' field if no rooms", async () => {
        const token = await generateValidToken();
        const hotel = await createHotel();
        const hotelId = hotel.id;
    
        const response = await server.get(`/hotels/${hotelId}`).set("Authorization", `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual({
          id: hotel.id,
          name: hotel.name,
          image: hotel.image,
          createdAt: hotel.createdAt.toISOString(),
          updatedAt: hotel.updatedAt.toISOString(),
          rooms: []
        });
      })

      it("should respond with status 200 and an hotel data including rooms", async () => {
        const token = await generateValidToken();
        const hotel = await createHotel();
        const hotelId = hotel.id;
        const room = await createRoom(hotelId);
    
        const response = await server.get(`/hotels/${hotelId}`).set("Authorization", `Bearer ${token}`);
    
        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual({
          id: hotel.id,
          name: hotel.name,
          image: hotel.image,
          createdAt: hotel.createdAt.toISOString(),
          updatedAt: hotel.updatedAt.toISOString(),
          rooms: [{
            id: room.id,
            name: room.name,
            capacity: room.capacity,
            hotelId: room.hotelId,
            createdAt: room.createdAt.toISOString(),
            updatedAt: room.updatedAt.toISOString()
          }]
        });
      })
  })
})