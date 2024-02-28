import { type NextRequest } from 'next/server'
import { cancelAppointment } from '@/app/lib/actions';


export async function POST(
    request: Request,
    { params }: { params: { appointmentId: string } }
  ) {
  
    await cancelAppointment(params.appointmentId);
  
    return new Response('Appointment cancelled', {
      status: 200,
    })
  }
  