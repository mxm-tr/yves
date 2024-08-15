import { auth } from "@/app/auth"
import { NextRequest, NextResponse } from "next/server"

import { scheduleAppointment } from '@/app/lib/appointments';
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

        // Call the scheduleAppointment function to get the appointmentId
        const appointmentId = await scheduleAppointment(session.user.id, scheduleId);
        // Return a successful response with the appointmentId value in the string
        return new Response(`Appointment ${appointmentId} booked`, {
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
