import { auth } from "@/app/auth"
import { NextRequest, NextResponse } from "next/server"

import { bookMeeting } from '@/app/lib/meetings';
import { InsufficientCoinsError } from '@/app/lib/models';

export async function POST(
    request: Request,
    { params }: { params: { slug: string } }
) {

    const session = await auth();

    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Get scheduleId from params
        const scheduleId = params.slug;

        // Call the scheduleMeeting function to get the meetingId
        const meetingId = await bookMeeting(session.user.id, scheduleId);
        // Return a successful response with the meetingId value in the string
        return new Response(`Meeting ${meetingId} booked`, {
            status: 200,
        });

    }
    catch (error) {
        if (error instanceof InsufficientCoinsError) {
            return new Response(error.message, { status: 400 });
        }
        else {
            // Handle errors here
            console.error(error);

            // Return an error response
            return new Response('Internal Server Error', {
                status: 500,
            });
        }
    }
}
