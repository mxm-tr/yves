import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to get the amount on the user's account
export async function getUserWalletAmount(userId: string): Promise<number | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { coins: true },
  });

  return user?.coins ?? null;
}

// Function to update the user's wallet amount when an appointment is confirmed
export async function updateUserWallet(userId: string, amount: number): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { coins: { increment: amount } },
  });
}


export async function getAcquaintances(): Promise<User[]> {
  // TODO: Change this to current user
  const currentUser = await prisma.user.findFirst({ where: { email: "john@example.com" } });
  return prisma.user.findMany({
    relationLoadStrategy: 'join', // or 'query'
    include: {
      // Join followers
      followers: {
        select: {
          follower: {
            select: {
              id: true,
              pseudo: true,
            }
          }
        }
      },
      // Join followed
      followed: {
        select: {
          followed: {
            select: {
              id: true,
              pseudo: true,
            }
          }
        }
      }
    },
    // Only consider the following requests that were accepted
    where: {
      AND: [
        {
          id: { not: currentUser!.id }
        },
        {
          followers: {
            every: {
              confirmed: true
            }
          }
        },
        {
          followed: {
            every: {
              confirmed: true
            }
          }
        }
      ]
    }
  }
  )
}
