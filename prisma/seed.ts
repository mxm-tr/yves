// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findOrCreateMeeting(date: Date, ownerId: string, cost: number = 0) {
    const existingMeeting = await prisma.meeting.findFirst({
        where: {
            AND: [
                { date: { equals: date } },
                { ownerId: { equals: ownerId } },
            ],
        },
    });

    if (existingMeeting) {
        return existingMeeting;
    }

    return prisma.meeting.create({
        data: {
            date,
            owner: {
                connect: {
                    id: ownerId,
                },
            },
            cost: cost
        },
    });
}

async function findOrCreateMeetingConfirmation(meetingId: string, userId: string, confirm: boolean) {
    const existingMeetingConfirmation = await prisma.meetingConfirmation.findUnique({
        where: {
            meetingId_userId: {  // Compound unique key
                meetingId: meetingId,
                userId: userId,
            },
        },
    });

    if (existingMeetingConfirmation) {
        return existingMeetingConfirmation;
    }

    // Now insert the confirmation
    return await prisma.meetingConfirmation.create({
        data: {
            meetingId: meetingId,
            userId: userId,
            isConfirmed: confirm,
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
            name: 'John Doe',
            email: 'john@example.com',
            coins: 5
        },
    });

    const user2 = await prisma.user.upsert({
        where: {
            email: 'jane@example.com',
        },
        update: {},
        create: {
            name: 'Jane Doe',
            email: 'jane@example.com',
        },
    });

    // Seed Meetings
    const meeting1 = await findOrCreateMeeting(new Date('2022-12-01T08:00:00Z'), user2.id, 10);
    const meeting2 = await findOrCreateMeeting(new Date('2022-12-02T10:00:00Z'), user2.id);
    const meeting3 = await findOrCreateMeeting(new Date('2022-12-03T10:00:00Z'), user2.id, 2);
    const meeting4 = await findOrCreateMeeting(new Date('2022-12-03T11:00:00Z'), user2.id);
    const meeting5 = await findOrCreateMeeting(new Date('2022-12-02T11:00:00Z'), user1.id);
    const meeting6 = await findOrCreateMeeting(new Date('2022-12-03T11:00:00Z'), user1.id, 2);

    // Seed Meetings

    // Meetings John took with Jane
    const meetingConfirmation1 = await findOrCreateMeetingConfirmation(meeting1.id, user1.id, true);
    const meetingConfirmation2 = await findOrCreateMeetingConfirmation(meeting2.id, user1.id, false);

    // Meetings Jane took with John
    const meetingConfirmation3 = await findOrCreateMeetingConfirmation(meeting5.id, user2.id, true);
    const meetingConfirmation4 = await findOrCreateMeetingConfirmation(meeting6.id, user2.id, false);

    console.log('Seed data inserted successfully');
}

main()
    .catch((e) => {
        throw e;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
