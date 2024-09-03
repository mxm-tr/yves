import { auth } from "@/app/auth"
import { getCurrentUserMeetingsGroupedByDay } from '@/app/lib/meetings';
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session && session.user?.id) {
    // Get a user's available schedules
    const users = await getCurrentUserMeetingsGroupedByDay(session.user?.id);
    return Response.json(users)
  }
}