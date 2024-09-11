import { auth } from "@/app/auth"
import { editMeeting, deleteMeeting } from '@/app/lib/meetings';
import { NextResponse } from "next/server"

export async function DELETE(
  request: Request,
  { params }: { params: { meetingId: string } } // It's actually a meetingId...
) {

  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await deleteMeeting(session.user.id, params.meetingId);

  return new Response('Meeting cancelled', {
    status: 200,
  })
}

export async function POST(
  request: Request,
  { params }: { params: { meetingId: string } }
) {

  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { date, cost, durationMinutes, numberOfGuests } = body;

    // Validate the input (you can add more validation as needed)
    if (!date || typeof cost !== 'number' || typeof numberOfGuests !== 'number') {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    // Create the meeting
    const newMeeting = await editMeeting(
      params.meetingId,
      {
        date: new Date(date),
        cost,
        durationMinutes,
        numberOfGuests,
        ownerId: session.user.id,
      });

    return NextResponse.json(newMeeting, { status: 201 });
  } catch (error) {
    console.error("Error creating meeting:", error);
    return NextResponse.json({ message: "Error creating meeting" }, { status: 500 });
  }
};
