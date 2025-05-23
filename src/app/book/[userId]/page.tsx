import { auth } from "@/app/auth"
import ScheduleForm from "@/app/book/[userId]/book"
import { SessionProvider } from "next-auth/react"

export default async function ClientPage() {
  const session = await auth()
  if (session?.user) {
    // TODO: Look into https://react.dev/reference/react/experimental_taintObjectReference
    // filter out sensitive data before passing to client.
    session.user = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
    }
  }

  return (
    <SessionProvider basePath={"/api/auth"} session={session}>
      <ScheduleForm />
    </SessionProvider>
  )
}