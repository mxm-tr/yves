import { auth } from "@/app/auth"
import { ackPing } from '@/app/lib/pings';
import { NextResponse } from "next/server"

export async function POST(
  request: Request,
  { params }: { params: { pingId: string } }
) {
  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session && session.user?.id) {
    // Send a ping to a user
    return await ackPing(session.user?.id, params.pingId);
  }
}