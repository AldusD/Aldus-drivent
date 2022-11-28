import faker from "@faker-js/faker";
import { prisma } from "@/config";
import { TicketStatus } from "@prisma/client";

export async function createHotel () {
    return await prisma.hotel.create({
        data: {
            name: "Enotel",
            image: "http://checkhotel.com/logo.jpg"
        }
    })
}

export async function createRoom (hotelId: number) {
    return await prisma.room.create({
        data: {
            name: '101',
            capacity: 3,
            hotelId
        }
    })
}

// model Room {
    // id        Int       @id @default(autoincrement())
    // name      String
    // capacity  Int
    // hotelId   Int
    // Hotel     Hotel     @relation(fields: [hotelId], references: [id])
    // Booking   Booking[]
    // createdAt DateTime  @default(now())
    // updatedAt DateTime  @updatedAt
//   }