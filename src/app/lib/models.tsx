import { PrismaClient, Appointment, Schedule, User } from '@prisma/client';

export interface AppointmentWithSchedule extends Appointment {
    schedule: ScheduleWithOwner
}

export interface AppointmentWithScheduleAndUser extends AppointmentWithSchedule {
    user: User
}

export interface ScheduleWithOwner extends Schedule {
    owner: User
}

// Custom error classes
export class InsufficientCoinsError extends Error {
    constructor() {
        super("Not enough coins 😢");
        this.name = 'InsufficientCoinsError';
    }
}

export class WalletAmountNotFoundError extends Error {
    constructor() {
        super("Wallet not found 👛");
        this.name = 'WalletAmountNotFoundError';
    }
}