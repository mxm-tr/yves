import { getAppointmentsTakenWithMe } from '@/app/lib/appointments';

export async function GET() {
  const appointments = await getAppointmentsTakenWithMe();
  return Response.json(appointments)
}