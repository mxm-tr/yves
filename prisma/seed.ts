// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findOrCreateAppointment(userId: string, scheduleId: string, confirmed: boolean) {
    const existingAppointment = await prisma.appointment.findFirst({
        where: {
            AND: [
                { userId: { equals: userId } },
                { scheduleId: { equals: scheduleId } },
            ],
        },
    });

    if (existingAppointment) {
        return existingAppointment;
    }
    return prisma.appointment.create({
        data: {
            user: {
                connect: {
                    id: userId,
                },
            },
            schedule: {
                connect: {
                    id: scheduleId,
                },
            },
            confirmed: confirmed,
        },
    });
}

async function findOrCreateSchedule(date: Date, ownerId: string) {
    const existingSchedule = await prisma.schedule.findFirst({
        where: {
            AND: [
                { date: { equals: date } },
                { ownerId: { equals: ownerId } },
            ],
        },
    });

    if (existingSchedule) {
        return existingSchedule;
    }

    return prisma.schedule.create({
        data: {
            date,
            owner: {
                connect: {
                    id: ownerId,
                },
            },
        },
    });
}

async function main() {
    // Seed Users
    const user1 = await prisma.user.upsert({
        where: {
            email: 'john@example.com',
        },
        update: {},
        create: {
            pseudo: 'John Doe',
            email: 'john@example.com',
        },
    });

    const user2 = await prisma.user.upsert({
        where: {
            email: 'jane@example.com',
        },
        update: {},
        create: {
            pseudo: 'Jane Doe',
            email: 'jane@example.com',
        },
    });

    // Seed Schedules
    const schedule1 = await findOrCreateSchedule(new Date('2022-12-01T08:00:00Z'), user2.id);
    const schedule2 = await findOrCreateSchedule(new Date('2022-12-02T10:00:00Z'), user2.id);
    const schedule3 = await findOrCreateSchedule(new Date('2022-12-03T10:00:00Z'), user2.id);
    const schedule4 = await findOrCreateSchedule(new Date('2022-12-03T11:00:00Z'), user2.id);
    const schedule5 = await findOrCreateSchedule(new Date('2022-12-02T11:00:00Z'), user1.id);
    const schedule6 = await findOrCreateSchedule(new Date('2022-12-03T11:00:00Z'), user1.id);

    // Seed Appointments

    // Appointments John took with Jane
    const appointment1 = await findOrCreateAppointment(user1.id, schedule1.id, true);
    const appointment2 = await findOrCreateAppointment(user1.id, schedule2.id, false);
    
    // Appointments Jane took with John
    const appointment3 = await findOrCreateAppointment(user2.id, schedule5.id, true);
    const appointment4 = await findOrCreateAppointment(user2.id, schedule6.id, false);

    console.log('Seed data inserted successfully');
}

main()
    .catch((e) => {
        throw e;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
