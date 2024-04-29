import { getCurrentUser } from '@/app/lib/users';

export async function GET() {
  // Get current user
  const user = await getCurrentUser();
  return Response.json(user)
}