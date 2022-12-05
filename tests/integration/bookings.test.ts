import app, { init } from "@/app";
import { prisma } from "@/config";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import e from "express";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
  createEnrollmentWithAddress,
  createUser,
  createTicketType,
  createTicket,
  createPayment,
  generateCreditCardData,
  createTicketTypeWithHotel,
  createTicketTypeRemote,
  createHotel,
  createRoomWithHotelId,
  createBooking,
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/booking");
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    
    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 if user has no booking", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      
      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
      
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 200 and a user's bookingId", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(user.id, room.id);
    
      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
    
      expect(response.status).toEqual(httpStatus.OK);
    
      expect(response.body).toEqual({
        id: booking.id,
        Room: {
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          hotelId: room.hotelId,
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString()
        }
      });
    });
  });
});

describe("POST /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/booking");
      
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
      
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
      
    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);
      
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
      
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
      
    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);
      
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    describe("when user is not eligible for booking", () => {
      it("should respond with status 403 if no enrollment for given user", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
      
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
    
        const response = await server.post("/booking")
          .send({
            roomId: room.id
          })
          .set("Authorization", `Bearer ${token}`);
    
        expect(response.status).toEqual(httpStatus.FORBIDDEN);
      });

      it("should respond with status 403 if no ticket for given user", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
      
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
      
        const response = await server.post("/booking")
          .send({
            roomId: room.id
          })
          .set("Authorization", `Bearer ${token}`);
      
        expect(response.status).toEqual(httpStatus.FORBIDDEN);
      });

      it("should respond with status 403 if no paid ticket for given user", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
      
        const response = await server.post("/booking")
          .send({
            roomId: room.id
          })
          .set("Authorization", `Bearer ${token}`);
      
        expect(response.status).toEqual(httpStatus.FORBIDDEN);
      });

      it("should respond with status 403 if no paid ticket for given user", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
      
        const response = await server.post("/booking")
          .send({
            roomId: room.id
          })
          .set("Authorization", `Bearer ${token}`);
      
        expect(response.status).toEqual(httpStatus.FORBIDDEN);
      });

      it("should respond with status 403 if remote ticket", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeRemote();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
      
        const response = await server.post("/booking")
          .send({
            roomId: room.id
          })
          .set("Authorization", `Bearer ${token}`);
      
        expect(response.status).toEqual(httpStatus.FORBIDDEN);
      });

      it("should respond with status 403 if ticket does not includes hotel", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketType({ value: false }, { value: false });
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
      
        const response = await server.post("/booking")
          .send({
            roomId: room.id
          })
          .set("Authorization", `Bearer ${token}`);
      
        expect(response.status).toEqual(httpStatus.FORBIDDEN);
      });
      
      it("should respond with status 403 if ticket does not includes hotel", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketType({ value: false }, { value: false });
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      
        const hotel = await createHotel();
        const room = await createRoomWithHotelId(hotel.id);
      
        const response = await server.post("/booking")
          .send({
            roomId: room.id
          })
          .set("Authorization", `Bearer ${token}`);
      
        expect(response.status).toEqual(httpStatus.FORBIDDEN);
      });
    });

    it("should respond with status 404 if roomId is not valid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
  
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      
      const response = await server.post("/booking")
        .send(
          {
            roomId: 0
          }
        )
        .set("Authorization", `Bearer ${token}`);
      
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
    
    // equivalent partition and limit values (for capacity 3) 0, 2, 3, 4 bookings
        
    it("should respond with status 403 if room is full", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
  
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const user1 = await createUser();
      const user2 = await createUser();
      const user3 = await createUser();
      await createBooking(user1.id, room.id);
      await createBooking(user2.id, room.id);
      await createBooking(user3.id, room.id);  

      const response = await server.post("/booking")
        .send(
          {
            roomId: room.id
          }
        )
        .set("Authorization", `Bearer ${token}`);
      
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if room is full (limit values)", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
  
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const user1 = await createUser();
      const user2 = await createUser();
      const user3 = await createUser();
      const user4 = await createUser();
      await createBooking(user1.id, room.id);
      await createBooking(user2.id, room.id);
      await createBooking(user3.id, room.id);  
      await createBooking(user4.id, room.id);

      const response = await server.post("/booking")
        .send(
          {
            roomId: room.id
          }
        )
        .set("Authorization", `Bearer ${token}`);
      
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if user already has a booking", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(user.id, room.id);
      
      const response = await server.post("/booking")
        .send(
          {
            roomId: room.id
          }
        )
        .set("Authorization", `Bearer ${token}`);
      
      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 200 if room available", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
  
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const response = await server.post("/booking")
        .send(
          {
            roomId: room.id
          }
        )
        .set("Authorization", `Bearer ${token}`);

      const booking = await prisma.booking.findFirst({
        where: {
          userId: user.id
        }
      });
      
      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({ bookingId: booking.id });
    });

    it("should respond with status 200 if room available (limit values)", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
  
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const user1 = await createUser();
      const user2 = await createUser();
      await createBooking(user1.id, room.id);
      await createBooking(user2.id, room.id);

      const response = await server.post("/booking")
        .send(
          {
            roomId: room.id
          }
        )
        .set("Authorization", `Bearer ${token}`);

      const booking = await prisma.booking.findFirst({
        where: {
          userId: user.id
        }
      });
      
      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({ bookingId: booking.id });
    });
  });
});

describe("PUT /booking/:bookingId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const user = await createUser();
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const booking = await createBooking(user.id, room.id);
        
    const response = await server.put(`/booking/${booking.id}`);
        
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
        
  it("should respond with status 401 if given token is not valid", async () => {
    const user = await createUser();
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const booking = await createBooking(user.id, room.id);
    const token = faker.lorem.word();
        
    const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`);
        
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
        
  it("should respond with status 401 if there is no session for given token", async () => {
    const user = await createUser();
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const booking = await createBooking(user.id, room.id);
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
      
    const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`);
      
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  // user does not have booking but attempts to access route using another's user booking id
  it("should respond with status 403 if user does not have a booking", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);  
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);

    const user1 = await createUser();
    const booking = await createBooking(user1.id, room.id);
  
    const response = await server.put(`/booking/${booking.id}`)
      .send(
        {
          roomId: room.id
        }
      )
      .set("Authorization", `Bearer ${token}`);
      
    expect(response.status).toEqual(httpStatus.FORBIDDEN);
  });

  it("should respond with status 403 if bookingId is invalid", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);  
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const booking = await createBooking(user.id, room.id);
    
    const response = await server.put("/booking/0")
      .send(
        {
          roomId: room.id
        }
      )
      .set("Authorization", `Bearer ${token}`);
        
    expect(response.status).toEqual(httpStatus.FORBIDDEN);
  });

  it("should respond with status 403 if user's booking is not the one of the id param", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);  
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const booking = await createBooking(user.id, room.id);

    const user1 = await createUser();
    const booking1 = await createBooking(user1.id, room.id);
  
    const response = await server.put(`/booking/${booking1.id}`)
      .send(
        {
          roomId: room.id
        }
      )
      .set("Authorization", `Bearer ${token}`);
      
    expect(response.status).toEqual(httpStatus.FORBIDDEN);
  });

  it("should respond with status 404 if roomId is invalid", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);  
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const booking = await createBooking(user.id, room.id); 

    const response = await server.put(`/booking/${booking.id}`)
      .send(
        {
          roomId: 0
        }
      )
      .set("Authorization", `Bearer ${token}`);
      
    expect(response.status).toEqual(httpStatus.NOT_FOUND);
  });

  it("should respond with status 403 if new room is full", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);  
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const room1 = await createRoomWithHotelId(hotel.id);
    const booking = await createBooking(user.id, room.id); 

    const user1 = await createUser();
    const user2 = await createUser();
    const user3 = await createUser();
    await createBooking(user1.id, room1.id);
    await createBooking(user2.id, room1.id);
    await createBooking(user3.id, room1.id); 

    const response = await server.put(`/booking/${booking.id}`)
      .send(
        {
          roomId: room1.id
        }
      )
      .set("Authorization", `Bearer ${token}`);
      
    expect(response.status).toEqual(httpStatus.FORBIDDEN);
  });

  it("should respond with status 403 if new room is full (limits values)", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);  
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const room1 = await createRoomWithHotelId(hotel.id);
    const booking = await createBooking(user.id, room.id); 

    const user1 = await createUser();
    const user2 = await createUser();
    const user3 = await createUser();
    const user4 = await createUser();
    await createBooking(user1.id, room1.id);
    await createBooking(user2.id, room1.id);
    await createBooking(user3.id, room1.id);
    await createBooking(user4.id, room1.id);

    const response = await server.put(`/booking/${booking.id}`)
      .send(
        {
          roomId: room1.id
        }
      )
      .set("Authorization", `Bearer ${token}`);
      
    expect(response.status).toEqual(httpStatus.FORBIDDEN);
  });

  it("should respond with status 403 if new room the previous one", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);  
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const booking = await createBooking(user.id, room.id); 
  
    const response = await server.put(`/booking/${booking.id}`)
      .send(
        {
          roomId: room.id
        }
      )
      .set("Authorization", `Bearer ${token}`);
      
    expect(response.status).toEqual(httpStatus.FORBIDDEN);
  });

  it("should respond with status 200 and the new roomId", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);  
    const hotel = await createHotel();
    const room = await createRoomWithHotelId(hotel.id);
    const room1 = await createRoomWithHotelId(hotel.id);
    const booking = await createBooking(user.id, room.id); 
  
    const response = await server.put(`/booking/${booking.id}`)
      .send(
        {
          roomId: room1.id
        }
      )
      .set("Authorization", `Bearer ${token}`);

    const updatedBooking = await prisma.booking.findUnique({
      where: {
        id: booking.id
      }
    });
        
    expect(response.status).toEqual(httpStatus.OK);
    expect(response.body).toEqual({ roomId: room1.id });
    expect(updatedBooking.roomId).toBe(room1.id);
  });
});
