-- CreateTable
CREATE TABLE "followingLinks" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followedId" TEXT NOT NULL,
    "confirmed" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "followingLinks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "followingLinks" ADD CONSTRAINT "followingLinks_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "followingLinks" ADD CONSTRAINT "followingLinks_followedId_fkey" FOREIGN KEY ("followedId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
