import { getAcquaintances } from '@/app/lib/users';

export async function GET() {
  // Get followed users
  const users = await getAcquaintances();
  return Response.json(users)
}