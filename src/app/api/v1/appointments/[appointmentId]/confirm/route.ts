import { type NextRequest } from 'next/server'
import { confirmAppointment } from '@/app/lib/actions';


export async function POST(
    request: Request,
    { params }: { params: { appointmentId: string } }
  ) {
  
    await confirmAppointment(params.appointmentId);
  
    return new Response('Appointment confirmed', {
      status: 200,
    })
  }
  