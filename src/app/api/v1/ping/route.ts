import { auth } from "@/app/auth"
import { getPings } from '@/app/lib/pings';
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
) {
  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session && session.user?.id) {
    // Send a ping to a user
    return await getPings(session.user?.id);
  }
}