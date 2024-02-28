import { getAppointments } from '@/app/lib/actions';

export async function GET() {
  const appointments = await getAppointments();
  return Response.json(appointments)
}