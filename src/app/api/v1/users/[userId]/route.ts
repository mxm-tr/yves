import { auth } from "@/app/auth"
import { getAcquaintance } from '@/app/lib/users';
import { NextResponse } from "next/server"

export async function GET(request: Request, props: { params: Promise<{ userId: string }> }) {
  const params = await props.params;
  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session && session.user?.id) {
    // Get current user's friend if any
    return await getAcquaintance(session.user?.id, params.userId);
  }
}