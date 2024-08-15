import { auth } from "@/app/auth"
import { confirmAppointment } from '@/app/lib/appointments';
import { InsufficientCoinsError, WalletAmountNotFoundError } from '@/app/lib/models';
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  request: Request,
  { params }: { params: { appointmentId: string } }
) {
  try {

    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await confirmAppointment(session.user.id, params.appointmentId);
    return new Response('Appointment confirmed', { status: 200 });
  } catch (error) {
    if (error instanceof InsufficientCoinsError) {
      return new Response(error.message, { status: 400 });
    } else if (error instanceof WalletAmountNotFoundError) {
      return new Response('Wallet amount not found', { status: 400 });
    } else {
      // Handle other errors or rethrow
      throw error;
    }
  }
}
