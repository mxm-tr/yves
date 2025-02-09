import { auth } from "@/app/auth"
import { getMeetingsTakenWithMe } from '@/app/lib/meetings';
import { NextResponse } from "next/server"


export async function GET(request: Request, props: { params: Promise<{ userId: string }> }) {

  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session && session.user?.id) {
    // Get a user's available schedules
    const users = await getMeetingsTakenWithMe(session.user?.id);
    return Response.json(users)
  }
}