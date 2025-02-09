import { auth } from "@/app/auth"
import { cancelMeeting } from '@/app/lib/meetings';
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  request: Request,
  props: { params: Promise<{ meetingConfirmationId: string }> }
) {
  const params = await props.params;

  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await cancelMeeting(session.user.id, params.meetingConfirmationId);

  return new Response('Meeting cancelled', {
    status: 200,
  })
}
