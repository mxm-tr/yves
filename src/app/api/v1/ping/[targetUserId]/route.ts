import { auth } from "@/app/auth"
import { sendPing } from '@/app/lib/pings';
import { NextResponse } from "next/server"

export async function POST(
  request: Request,
  { params }: { params: { targetUserId: string } }
) {
  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session && session.user?.id) {
    // Send a ping to a user
    return await sendPing(session.user?.id, params.targetUserId);
  }
}