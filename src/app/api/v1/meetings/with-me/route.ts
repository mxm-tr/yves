import { auth } from "@/app/auth"
import { getMeetingsTakenWithMe } from '@/app/lib/meetings';
import { NextResponse } from "next/server"

export const GET = auth(async function GET(req) {
  if (req.auth && req.auth.user?.id) {
    // Get current user
    const meetings = await getMeetingsTakenWithMe(req.auth.user?.id);
    return Response.json(meetings)
  }
  return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
})