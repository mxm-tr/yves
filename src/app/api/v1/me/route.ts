import { auth } from "@/app/auth"
import { getCurrentUser } from '@/app/lib/users';
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
) {
  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get current user
  const user = await getCurrentUser(session.user?.id);
  return Response.json(user)
}