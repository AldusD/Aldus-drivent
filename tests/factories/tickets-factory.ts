import faker from "@faker-js/faker";
import { prisma } from "@/config";
import { TicketStatus } from "@prisma/client";

type BoolContainer = {
  value: boolean
}

export async function createTicketType(isRemote?: BoolContainer, includesHotel?: BoolContainer) {
  return prisma.ticketType.create({
    data: {
      name: faker.name.findName(),
      price: faker.datatype.number(),
      isRemote: (isRemote)? isRemote.value : faker.datatype.boolean(),
      includesHotel: (includesHotel)? includesHotel.value : faker.datatype.boolean(),
    },
  });
}

export async function createTicketTypeRemote() {
  return prisma.ticketType.create({
    data: {
      name: faker.name.findName(),
      price: faker.datatype.number(),
      isRemote: true,
      includesHotel: faker.datatype.boolean(),
    },
  });
}

export async function createTicketTypeWithHotel() {
  return prisma.ticketType.create({
    data: {
      name: faker.name.findName(),
      price: faker.datatype.number(),
      isRemote: false,
      includesHotel: true,
    },
  });
}

export async function createTicket(enrollmentId: number, ticketTypeId: number, status: TicketStatus) {
  return prisma.ticket.create({
    data: {
      enrollmentId,
      ticketTypeId,
      status,
    },
  });
}
