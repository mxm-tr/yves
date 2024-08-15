
'use server'
import { Appointment, PrismaClient } from '@prisma/client';

import { getUserWalletAmount, updateUserWallet } from './users';

import { InsufficientCoinsError } from './models';

const prisma = new PrismaClient();

export async function getAppointments(userId: string) {
    const currentUser = await prisma.user.findFirst({ where: { id: userId } });

    return prisma.appointment.findMany({
        relationLoadStrategy: 'join', // or 'query'
        include: {
            schedule: {
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
        // Select appointments with the user
        where: {
            userId: currentUser?.id
        }
    });
}

export async function getAppointmentsTakenWithMe(userId: string) {
    const currentUser = await prisma.user.findFirst({ where: { id: userId } });

    return prisma.appointment.findMany({
        relationLoadStrategy: 'join', // or 'query'
        include: {
            user: {
                select: {
                    id: true,
                    name: true
                }
            },
            schedule: {
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
        // Select appointments the user booked
        where: {
            schedule: {
                ownerId: currentUser?.id
            }
        }
    });
}

export async function cancelAppointment(userId: string, appointmentId: string): Promise<void> {
    await prisma.appointment.delete({
        where: { id: appointmentId, userId: userId },
    });
}

// Function to confirm an appointment only if the user's wallet has enough coins
export async function confirmAppointment(userId: string, appointmentId: string): Promise<void> {
    // Get the current user
    const currentUser = await prisma.user.findFirst({ where: { id: userId } });

    if (!currentUser) {
        throw new Error('User not found');
    }

    // Check if the appointment exists
    const existingAppointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
            schedule: {
                select: {
                    cost: true
                }
            }
        }
    });

    if (!existingAppointment) {
        // Throw a custom error for non-existing appointment
        throw new Error('Appointment not found');
    }


    await prisma.appointment.update({
        where: { id: appointmentId },
        data: { confirmed: true, userId: currentUser.id },
    });

}

export async function writeAppointment(newAppointment: Appointment): Promise<void> {
    await prisma.appointment.create({ data: newAppointment });
}

export async function deleteAppointment(userId: string, appointmentId: string): Promise<void> {
    await prisma.appointment.delete({ where: { id: appointmentId, userId: userId } });
}

export async function scheduleAppointment(userId: string, scheduleId: string): Promise<string> {
    const currentUser = await prisma.user.findFirst({ where: { id: userId } });

    if (!currentUser) {
        throw new Error('User not found');
    }

    // Check if the schedule exists
    const existingSchedule = await prisma.schedule.findUnique({
        where: { id: scheduleId },
    });

    if (!existingSchedule) {
        // Throw a custom error for non-existing appointment
        throw new Error('Schedule not found');
    }

    // Get the amount on the user's account
    const walletAmount = await getUserWalletAmount(currentUser.id);


    if (walletAmount !== null) {
        const cost = existingSchedule.cost;

        if (cost != null) {

            if (walletAmount >= cost) {

                const createdAppointment = await prisma.appointment.create({
                    data: { userId: currentUser.id, scheduleId: scheduleId, confirmed: false },
                });

                await updateUserWallet(currentUser.id, - cost);
                return createdAppointment.id;
            } else {
                // Throw a custom error for insufficient coins
                throw new InsufficientCoinsError();
            }
        }
        else {
            throw Error("Error getting cost for the appointment")
        }
    }

    return ""

}
