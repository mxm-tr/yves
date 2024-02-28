import { type NextRequest } from 'next/server'
import { scheduleAppointment } from '@/app/lib/actions';


export async function POST(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        // Get scheduleId from params
        const scheduleId = params.slug;

        // Call the scheduleAppointment function to get the appointmentId
        const appointmentId = await scheduleAppointment(scheduleId);

        // Return a successful response with the appointmentId value in the string
        return new Response(`Appointment ${appointmentId} booked`, {
            status: 200,
        });
    } catch (error) {
        // Handle errors here
        console.error('Error:', error);

        // Return an error response
        return new Response('Internal Server Error', {
            status: 500,
        });
    }
}

