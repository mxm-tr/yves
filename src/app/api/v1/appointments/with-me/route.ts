import { getAppointmentsTakenWithMe } from '@/app/lib/actions';

export async function GET() {
  const appointments = await getAppointmentsTakenWithMe();
  return Response.json(appointments)
}