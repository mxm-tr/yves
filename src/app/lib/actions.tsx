'use server'
import { PrismaClient, Appointment, Schedule, User } from '@prisma/client';

const prisma = new PrismaClient();

export async function getAcquaintances(): Promise<User[]> {
    // TODO: Change this to current user
    const currentUser = await prisma.user.findFirst({ where: { email: "john@example.com" } });
    return prisma.user.findMany({
        relationLoadStrategy: 'join', // or 'query'
        include: {
            // Join followers
            followers: {
                select: {
                    follower: {
                        select: {
                            id: true,
                            pseudo: true,
                        }
                    }
                }
            },
            // Join followed
            followed: {
                select: {
                    followed: {
                        select: {
                            id: true,
                            pseudo: true,
                        }
                    }
                }
            }
        },
        // Only consider the following requests that were accepted
        where: {
            AND: [
                {
                    id: { not: currentUser!.id }
                },
                {
                    followers: {
                        every: {
                            confirmed: true
                        }
                    }
                },
                {
                    followed: {
                        every: {
                            confirmed: true
                        }
                    }
                }
            ]
        }
    }
    )
}

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

export async function getAppointments() {
    return prisma.appointment.findMany({
        relationLoadStrategy: 'join', // or 'query'
        include: {
            schedule: {
                include: {
                    owner: {
                        select: {
                            id: true,
                            pseudo: true
                        }
                    }
                }
            }
        }
    });
}

export async function writeAppointment(newAppointment: Appointment): Promise<void> {
    await prisma.appointment.create({ data: newAppointment });
}

export async function deleteAppointment(id: string): Promise<void> {
    await prisma.appointment.delete({ where: { id } });
}

export async function scheduleAppointment(scheduleId: string): Promise<string> {
    try {
        // TODO: Change this to current user
        const currentUser = await prisma.user.findFirst({ where: { email: "john@example.com" } });

        if (!currentUser) {
            throw new Error('User not found');
        }

        const createdAppointment = await prisma.appointment.create({
            data: { userId: currentUser.id, scheduleId: scheduleId, confirmed: false },
        });

        return createdAppointment.id;
    } catch (error) {
        // Handle errors here
        console.error('Error in scheduleAppointment:', error);

        // You can throw the error or return a specific error message
        throw new Error('Failed to schedule appointment');
    }
}
