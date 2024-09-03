import { auth } from "@/app/auth"
import { deleteMeeting } from '@/app/lib/meetings';
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(
  request: Request,
  { params }: { params: { meetingId: string } }
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
