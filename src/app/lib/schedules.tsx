'use server'
import { PrismaClient, Appointment, Schedule, User } from '@prisma/client';

const prisma = new PrismaClient();

export async function getSchedules(userId: string): Promise<Schedule[]> {
    // TODO: Change this to current user
    const currentUser = await prisma.user.findFirst({ where: { email: "john@example.com" } });

    return prisma.schedule.findMany({
        relationLoadStrategy: 'join', // or 'query'
        include: {
            // Join appointments
            appointments: true
        },
        where: {
            AND: [
                { ownerId: { not: currentUser!.id } }, // Do not display schedules owned by the current user
                { ownerId: userId }, // Display for the selected user
                {
                    OR: [
                        {
                            appointments: { none: {} } // Get schedules that have not been booked yet
                        },
                        {
                            appointments: {
                                some: {
                                    userId:
                                        { not: currentUser!.id } // Do not display schedules where appointments have already been made
                                }
                            }
                        }
                    ]
                }
            ]
        }
    });
}

export async function getSchedulesGroupedByUserDay(userId: string): Promise<{ [key: string]: Schedule[] }> {
    const schedules = await getSchedules(userId)

    // Group schedules by day
    const groupedSchedules: { [key: string]: Schedule[] } = {};
    schedules.forEach((schedule) => {
        const day = schedule.date.toISOString().split('T')[0]; // Extract day from date
        if (!groupedSchedules[day]) {
            groupedSchedules[day] = [];
        }
        groupedSchedules[day].push(schedule);
    });

    return groupedSchedules;
}
