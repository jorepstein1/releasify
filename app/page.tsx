import { auth, signIn, signOut } from "@/auth";
import { AppBar, Box, Button, Container, Toolbar } from "@mui/material";
import Image from "next/image";
import { Body } from "./ui/body";
const SignIn: React.FC<{ provider?: string }> = ({ provider }) => {
  return (
    <form
      action={async () => {
        "use server";
        await signIn(provider);
      }}
    >
      <Button
        variant="outlined"
        type="submit"
        sx={{ backgroundColor: "black" }}
      >
        Sign In
      </Button>{" "}
    </form>
  );
};

const SignOut: React.FC = () => {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <Button
        variant="outlined"
        type="submit"
        sx={{ backgroundColor: "black" }}
      >
        Sign Out
      </Button>
    </form>
  );
};

export default async function Home() {
  const session = await auth();
  console.log("session", session);
  return (
    <Box>
      <Box>
        <AppBar position="sticky">
          <Container>
            <Toolbar>
              <Image src="/logo.svg" alt="Logo" width={50} height={50} />
              {session?.access_token ? <SignOut /> : <SignIn />}
            </Toolbar>
          </Container>
        </AppBar>
      </Box>
      <Box>
        <Body />
      </Box>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <div>footer</div>
      </footer>
    </Box>
  );
}
