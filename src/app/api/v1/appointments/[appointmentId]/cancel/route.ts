import { cancelAppointment } from '@/app/lib/appointments';

export async function POST(
  request: Request,
  { params }: { params: { appointmentId: string } }
) {

  await cancelAppointment(params.appointmentId);

  return new Response('Appointment cancelled', {
    status: 200,
  })
}
