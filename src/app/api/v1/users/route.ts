import { auth } from "@/app/auth"
import { getAcquaintances } from '@/app/lib/users';
import { NextResponse } from "next/server"

export const GET = auth(async function GET(req) {
  if (req.auth && req.auth.user?.id) {
    // Get current user's friends
    const users = await getAcquaintances(req.auth.user?.id);
    return Response.json(users)
  }
  return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
})