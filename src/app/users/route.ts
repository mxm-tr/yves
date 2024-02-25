import { getAcquaintances } from '@/app/lib/actions';

export async function GET() {
  // Get followed users
  const users = await getAcquaintances();
  return Response.json(users)
}