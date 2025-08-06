import Image from "next/image";
import { auth, signIn, signOut } from "@/auth";
import { getNumUserPlaylists } from "@/app/spotifyApi";

function SignIn({
  provider,
  ...props
}: { provider?: string } & React.ComponentPropsWithRef<"button">) {
  return (
    <form
      action={async () => {
        "use server";
        await signIn(provider);
      }}
    >
      <button {...props}>Sign In</button>
    </form>
  );
}

function SignOut({
  provider,
  ...props
}: { provider?: string } & React.ComponentPropsWithRef<"button">) {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <button {...props}>Sign Out</button>
    </form>
  );
}

export default async function Home() {
  const session = await auth();
  console.log("session", session);
  if (!session?.access_token)
    return (
      <div>
        <SignIn />
      </div>
    );
  let numPlaylists = await getNumUserPlaylists(session.access_token);
  console.log("numPlaylists", numPlaylists);
  return (
    <div>
      <header>
        <SignOut />
      </header>
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div>{numPlaylists}</div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <div>footer</div>
      </footer>
    </div>
  );
}
