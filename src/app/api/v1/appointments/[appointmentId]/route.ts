import { auth } from "@/app/auth"
import { deleteAppointment } from '@/app/lib/appointments';
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(
  request: Request,
  { params }: { params: { appointmentId: string } }
) {

  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await deleteAppointment(session.user.id, params.appointmentId);

  return new Response('Appointment cancelled', {
    status: 200,
  })
}
