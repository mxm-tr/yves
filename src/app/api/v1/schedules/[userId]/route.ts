import { auth } from "@/app/auth"
import { getSchedulesGroupedByUserDay } from '@/app/lib/meetings';
import { NextResponse } from "next/server"

export async function GET(request: Request, props: { params: Promise<{ userId: string }> }) {
  const params = await props.params;
  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session && session.user?.id) {
    // Get a user's available schedules
    const users = await getSchedulesGroupedByUserDay(session.user?.id, params.userId);
    return Response.json(users)
  }
}