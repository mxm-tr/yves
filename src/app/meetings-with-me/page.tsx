import { auth } from "@/app/auth"
import MeetingsForm from "@/app/meetings-with-me/meetings"
import { SessionProvider } from "next-auth/react"

export default async function ClientPage() {
  const session = await auth()
  if (session?.user) {
    // TODO: Look into https://react.dev/reference/react/experimental_taintObjectReference
    // filter out sensitive data before passing to client.
    session.user = {
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
    }
  }

  return (
    <SessionProvider basePath={"/api/auth"} session={session}>
      <MeetingsForm />
    </SessionProvider>
  )
}