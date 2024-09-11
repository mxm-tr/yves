
'use server'
import { Meeting, PrismaClient } from '@prisma/client';

import { getUserWalletAmount, incrementUserWallet } from './users';

import { InsufficientCoinsError } from './models';

const prisma = new PrismaClient();

export async function createMeeting({
    date,
    cost,
    durationMinutes,
    numberOfGuests,
    ownerId,
}: {
    date: Date;
    cost: number;
    durationMinutes: number;
    numberOfGuests: number;
    ownerId: string;
}): Promise<Meeting> {
    // Validation logic
    if (cost < 0) {
        throw new Error("Cost cannot be negative");
    }
    if (numberOfGuests <= 0) {
        throw new Error("Number of guests must be at least 1");
    }

    // Create a new meeting
    const newMeeting = await prisma.meeting.create({
        data: {
            date,
            cost,
            durationMinutes,
            numberOfGuests,
            ownerId,
        },
    });

    return newMeeting;
}

export async function editMeeting(
    meetingId: string,
    {
        date,
        cost,
        durationMinutes,
        numberOfGuests,
        ownerId,
    }: {
        date: Date;
        cost: number;
        durationMinutes: number;
        numberOfGuests: number;
        ownerId: string;
    }): Promise<Meeting> {
    // Validation logic
    if (cost < 0) {
        throw new Error("Cost cannot be negative");
    }
    if (numberOfGuests <= 0) {
        throw new Error("Number of guests must be at least 1");
    }

    // Update a meeting
    const newMeeting = await prisma.meeting.update({
        where: { id: meetingId },
        data: {
            date,
            cost,
            durationMinutes,
            numberOfGuests,
            ownerId,
        },
    });

    return newMeeting;
}

export async function getMeetings(userId: string) {
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });

    return prisma.meetingConfirmation.findMany({
        relationLoadStrategy: 'join', // or 'query'
        include: {
            user: {
                select: {
                    id: true
                }
            },
            meeting: {
                include: {
                    owner: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            }
        },
        // Select meetings where this user has been invited
        where: {
            userId: { equals: currentUser?.id }
        }
    });
}

export async function getMeetingsTakenWithMe(userId: string) {
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });

    return prisma.meeting.findMany({
        relationLoadStrategy: 'join', // or 'query'
        include: {
            meetingConfirmations: {
                select: {
                    id: true,
                    isConfirmed: true,
                    user: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            },
            owner: {
                select: {
                    id: true,
                    name: true
                }
            }
        },
        where: {
            ownerId: currentUser?.id
        }
    });
}

export async function cancelMeeting(currentUserId: string, meetingConfirmationId: string): Promise<void> {
    const currentUser = await prisma.user.findUnique({ where: { id: currentUserId } });

    // Ensure currentUser is not undefined
    if (!currentUser) {
        throw new Error('user not found');
    }

    // Ensure meetingConfirmationId is not undefined
    if (!meetingConfirmationId) {
        throw new Error('MeetingConfirmation ID is required');
    }

    const meetingConfirmation = await prisma.meetingConfirmation.findFirst({
        select: {
            id: true,
            meeting: {
                select: {
                    cost: true
                }
            },
            user: {
                select: {
                    id: true,
                }
            }
        },
        where: {
            AND: [
                {
                    id: meetingConfirmationId,
                },
                {
                    OR: [
                        { userId: currentUserId },
                        {
                            meeting: {
                                ownerId: currentUser?.id
                            }
                        }
                    ]
                }
            ]
        },
    });

    // Ensure meetingConfirmationId is not undefined
    if (!meetingConfirmation) {
        throw new Error('MeetingConfirmation not found');
    }

    await prisma.meetingConfirmation.delete({ where: { id: meetingConfirmation.id } });

    // Credit the account of the user who booked
    await incrementUserWallet(meetingConfirmation.user.id, meetingConfirmation.meeting.cost);

}

// Function to confirm a meeting only if the current user owns the meeting
export async function confirmMeeting(currentUserId: string, meetingConfirmationId: string): Promise<void> {
    // Get the current user
    const currentUser = await prisma.user.findUnique({ where: { id: currentUserId } });

    if (!currentUser) {
        throw new Error('User not found');
    }

    // Check if the meeting exists
    const existingMeeting = await prisma.meeting.findFirst({
        where: { ownerId: currentUser.id, meetingConfirmations: { every: { id: meetingConfirmationId } } },
    });

    if (!existingMeeting) {
        // Throw a custom error for non-existing meeting
        throw new Error('Meeting not found');
    }

    // Ensure meetingConfirmationId is not undefined
    if (!meetingConfirmationId) {
        throw new Error('MeetingConfirmation ID is required');
    }

    // Update the isConfirmed field to true
    await prisma.meetingConfirmation.update({
        where: { id: meetingConfirmationId },
        data: { isConfirmed: true },
    });
}

export async function writeMeeting(newMeeting: Meeting): Promise<void> {
    await prisma.meeting.create({ data: newMeeting });
}

export async function deleteMeeting(currentUserId: string, meetingId: string): Promise<void> {
    // Get the current user
    const currentUser = await prisma.user.findUnique({ where: { id: currentUserId } });

    if (!currentUser) {
        throw new Error('User not found');
    }

    // Check if the meeting exists
    const existingMeeting = await prisma.meeting.findUnique({
        where: { ownerId: currentUser.id, id: meetingId },
    });

    if (!existingMeeting) {
        // Throw a custom error for non-existing meeting
        throw new Error('Meeting not found');
    }

    // Get all meeting confirmations ids and cancel them
    const existingMeetingConfirmations = await prisma.meetingConfirmation.findMany({
        where: { meetingId: meetingId },
        select: { id: true }
    });
    existingMeetingConfirmations.map((meetingConfirmation) => {
        cancelMeeting(currentUserId, meetingConfirmation.id)
    })

    await prisma.meeting.delete({ where: { ownerId: currentUserId, id: meetingId } });
}

export async function bookMeeting(userId: string, meetingId: string): Promise<string> {
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });

    if (!currentUser) {
        throw new Error('User not found');
    }

    // Check if the meeting exists
    const existingSchedule = await prisma.meeting.findUnique({
        where: { id: meetingId },
    });

    if (!existingSchedule) {
        // Throw a custom error for non-existing meeting
        throw new Error('Schedule not found');
    }

    // Get the amount on the user's account
    const walletAmount = await getUserWalletAmount(currentUser.id);


    if (walletAmount !== null) {
        const cost = existingSchedule.cost;

        if (cost != null) {

            if (walletAmount >= cost) {

                const createdMeeting = await prisma.meetingConfirmation.create({
                    data: { meetingId: meetingId, userId: userId, isConfirmed: false },
                });

                await incrementUserWallet(currentUser.id, - cost);
                return createdMeeting.id;
            } else {
                // Throw a custom error for insufficient coins
                throw new InsufficientCoinsError();
            }
        }
        else {
            throw Error("Error getting cost for the meeting")
        }
    }

    return ""

}

export async function getCurrentUserSchedules(currentUserId: string): Promise<Meeting[]> {
    return prisma.meeting.findMany({
        relationLoadStrategy: 'join', // or 'query'
        where: {
            AND: [
                { ownerId: currentUserId }, // Display for the selected user
                {
                    OR: [
                        {
                            meetingConfirmations: { none: {} } // Get schedules that have not been booked yet
                        },
                        {
                            meetingConfirmations: {
                                some: {
                                    userId:
                                        { not: currentUserId } // Do not display schedules where meetings have already been made
                                }
                            }
                        }
                    ]
                }
            ]
        }
    });
}

export async function getCurrentUserMeetingsGroupedByDay(currentUserId: string): Promise<{ [key: string]: Meeting[] }> {
    const schedules = await getCurrentUserSchedules(currentUserId)

    // Group schedules by day
    const groupedSchedules: { [key: string]: Meeting[] } = {};
    schedules.forEach((schedule) => {
        const day = schedule.date.toISOString().split('T')[0]; // Extract day from date
        if (!groupedSchedules[day]) {
            groupedSchedules[day] = [];
        }
        groupedSchedules[day].push(schedule);
    });

    return groupedSchedules;
}

export async function getSingleUserSchedules(currentUserId: string, userId: string): Promise<Meeting[]> {
    return prisma.meeting.findMany({
        relationLoadStrategy: 'join', // or 'query'
        where: {
            AND: [
                { ownerId: userId }, // Display for the selected user
                {
                    OR: [
                        {
                            meetingConfirmations: { none: {} } // Get schedules that have not been booked yet
                        },
                        {
                            meetingConfirmations: {
                                every: {
                                    userId: {
                                        not: {
                                            equals: currentUserId
                                        }
                                    }
                                }
                            }
                        }
                    ]
                }
            ]
        }
    });
}

export async function getSchedulesGroupedByUserDay(currentUserId: string, userId: string): Promise<{ [key: string]: Meeting[] }> {
    const schedules = await getSingleUserSchedules(currentUserId, userId)

    // Group schedules by day
    const groupedSchedules: { [key: string]: Meeting[] } = {};
    schedules.forEach((schedule) => {
        const day = schedule.date.toISOString().split('T')[0]; // Extract day from date
        if (!groupedSchedules[day]) {
            groupedSchedules[day] = [];
        }
        groupedSchedules[day].push(schedule);
    });

    return groupedSchedules;
}
