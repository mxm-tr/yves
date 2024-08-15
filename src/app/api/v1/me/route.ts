import { auth } from "@/app/auth"
import { getCurrentUser } from '@/app/lib/users';
import { NextResponse } from "next/server"

export const GET = auth(async function GET(req) {
  if (req.auth && req.auth.user?.id) {
    // Get current user
    const user = await getCurrentUser(req.auth.user?.id);
    return Response.json(user)
  }
  return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
})