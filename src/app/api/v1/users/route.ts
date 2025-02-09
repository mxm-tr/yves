import { auth } from "@/app/auth"
import { getAcquaintances } from '@/app/lib/users';
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const session = await auth();

  if (session && session.user?.id) {
    // Get current user's friends
    const users = await getAcquaintances(session.user?.id);
    return Response.json(users)
  }

  return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
}