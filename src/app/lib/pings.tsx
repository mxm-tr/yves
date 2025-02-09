
'use server'
import { PrismaClient } from '@prisma/client';

import { NextResponse } from "next/server"

const prisma = new PrismaClient();


export async function ackPing(currentUserId: string, pingId: string): Promise<NextResponse> {

    const currentUser = await prisma.user.findUnique({ where: { id: currentUserId } });

    if (!currentUser) {
        return NextResponse.json({ message: "Cannot find user" }, { status: 400 })
    }

    const currentPing = await prisma.ping.findFirst({
        relationLoadStrategy: 'join',
        where: {
            senderId: currentUser.id, // Display for the selected user
            id: pingId
        },
    });

    if (!currentPing) {
        return NextResponse.json({ message: "Cannot find ping" }, { status: 400 })
    }

    await prisma.ping.update({
        data: {
            acknowledged: true
        },
        where: {
            senderId: currentUser.id, // Display for the selected user
            id: pingId
        },
    });

    return NextResponse.json({"message": "ack"}, { status: 200 })
}

export async function getPings(currentUserId: string): Promise<NextResponse> {

    const currentUser = await prisma.user.findUnique({ where: { id: currentUserId } });

    if (!currentUser) {
        return NextResponse.json({ message: "Cannot find user" }, { status: 400 })
    }

    const currentPings = await prisma.ping.findMany({
        relationLoadStrategy: 'join',
        where: {
            senderId: currentUser.id, // Display for the selected user
            acknowledged: false
        },
        select: {
            createdAt: true,
            id: true,
            sender: {
                select: {
                    name: true,
                }
            }
        }
    });
    return NextResponse.json(currentPings, { status: 200 })
}

export async function sendPing(currentUserId: string, targetUserId: string): Promise<NextResponse> {

    const currentUser = await prisma.user.findUnique({ where: { id: currentUserId } });

    if (!currentUser) {
        return NextResponse.json({ message: "Cannot find user" }, { status: 400 })
    }

    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });

    if (!targetUser) {
        return NextResponse.json({ message: "Cannot find user" }, { status: 400 })
    }

    if (currentUserId == targetUserId) {
        return NextResponse.json({ message: "Cannot ping yourself" }, { status: 400 })
    }

    const currentDate = new Date(); // Get the current date and time
    currentDate.setHours(0, 0, 0, 0)


    const currentPings = await prisma.ping.findMany({
        relationLoadStrategy: 'join',   
        where: {
            AND: [
                { senderId: currentUser.id }, // Display for the selected user
                { receiverId: targetUser.id }, // Display for the selected user
                {
                    date: {
                        gt: currentDate // Only get pings after today at midnight
                    }
                },
            ]
        }
    });

    if (currentPings && currentPings.length > 0) {
        return NextResponse.json({ message: "Ping already sent today" }, { status: 400 })
    }

    // If no ping was found, write the ping
    await prisma.ping.create(
        {
            data: {
                receiverId: targetUser.id,
                senderId: currentUser.id
            }
        }
    )

    return NextResponse.json({ message: "Ping sent!" }, { status: 200 })
}

