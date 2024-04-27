import { confirmAppointment } from '@/app/lib/appointments';
import { InsufficientCoinsError, WalletAmountNotFoundError } from '@/app/lib/models';

export async function POST(
  request: Request,
  { params }: { params: { appointmentId: string } }
) {
  try {
    await confirmAppointment(params.appointmentId);
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
