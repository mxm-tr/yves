import { getSchedulesGroupedByUserDay } from '@/app/lib/actions';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  // Get userId from params
  const schedules = await getSchedulesGroupedByUserDay(params.userId);
  return Response.json(schedules)
}