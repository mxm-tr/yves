import { getAppointments } from '@/app/lib/actions';

export async function GET() {
  const appointments = await getAppointments();
  console.log(appointments);
  return Response.json(appointments)
}