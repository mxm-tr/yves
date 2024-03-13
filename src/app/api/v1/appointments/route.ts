import { getAppointments } from '@/app/lib/appointments';

export async function GET() {
  const appointments = await getAppointments();
  return Response.json(appointments)
}