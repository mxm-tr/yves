import { deleteAppointment } from '@/app/lib/appointments';

export async function DELETE(
  request: Request,
  { params }: { params: { appointmentId: string } }
) {

  await deleteAppointment(params.appointmentId);

  return new Response('Appointment cancelled', {
    status: 200,
  })
}
