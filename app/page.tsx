import Image from "next/image";
import { auth, signIn, signOut } from "@/auth";
import { getUserPlaylists } from "@/app/spotifyApi";
import { Playlists } from "./ui/playlists";
import { AppBar, Box, Button, Container, Paper, Toolbar } from "@mui/material";
import { Results } from "./ui/results";

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

let PlaylistContainer = async (props: { access_token: string }) => {
  const playlists = await getUserPlaylists(props.access_token);
  return <Playlists playlists={playlists} />;
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
              {session?.access_token ? <SignOut /> : <SignIn />}
            </Toolbar>
          </Container>
        </AppBar>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          gap: "16px",
        }}
      >
        <Paper sx={{ maxHeight: 800, margin: 5 }}>
          {session?.access_token ? (
            <PlaylistContainer access_token={session.access_token} />
          ) : (
            <SignIn />
          )}
        </Paper>
        <Paper sx={{ maxHeight: 800, overflowY: "auto", margin: 5 }}>
          <Results tracks={[]} />
        </Paper>
      </Box>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <div>footer</div>
      </footer>
    </Box>
  );
}
