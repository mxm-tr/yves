import { auth } from "@/app/auth"
import { getMeetings, createMeeting } from '@/app/lib/meetings';
import { NextResponse } from "next/server"

export const GET = auth(async function GET(req) {
  if (req.auth && req.auth.user?.id) {
    // Get current user's meetings
    const meetings = await getMeetings(req.auth.user?.id);
    return Response.json(meetings)
  }
  return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
});

export const POST = auth(async function POST(req) {
  if (req.auth && req.auth.user?.id) {
    try {
      const body = await req.json();
      const { date, cost, numberOfGuests } = body;

      // Validate the input (you can add more validation as needed)
      if (!date || typeof cost !== 'number' || typeof numberOfGuests !== 'number') {
        return NextResponse.json({ message: "Invalid input" }, { status: 400 });
      }

      // Create the meeting
      const newMeeting = await createMeeting({
        date: new Date(date),
        cost,
        numberOfGuests,
        ownerId: req.auth.user.id,
      });

      return NextResponse.json(newMeeting, { status: 201 });
    } catch (error) {
      console.error("Error creating meeting:", error);
      return NextResponse.json({ message: "Error creating meeting" }, { status: 500 });
    }
  }
  return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
});