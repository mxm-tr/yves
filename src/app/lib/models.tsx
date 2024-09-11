import { Meeting, User, MeetingConfirmation } from '@prisma/client';

export interface MeetingWithOwner extends Meeting {
    owner: User
}

export interface MeetingConfirmationsWithMeetingAndOwnerAndGuests extends MeetingConfirmation {
    meeting: MeetingWithOwner
    user: User
}

export interface MeetingsWithMeetingConfirmationsAndGuests extends Meeting {
    meetingConfirmations: MeetingConfirmationWithGuests[]
}

export interface MeetingConfirmationWithGuests extends MeetingConfirmation {
    user: User
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