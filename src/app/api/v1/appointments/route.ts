import { auth } from "@/app/auth"
import { getAppointments } from '@/app/lib/appointments';
import { NextResponse } from "next/server"

export const GET = auth(async function GET(req) {
  if (req.auth && req.auth.user?.id) {
    // Get current user's appointments
    const appointments = await getAppointments(req.auth.user?.id);
    return Response.json(appointments)
  }
  return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
})