import NextAuth, { type DefaultSession } from "next-auth";
import Spotify from "next-auth/providers/spotify";

declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } & DefaultSession["user"];
    accessToken: {
      access_token: string;
      refresh_token: string;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Spotify({
      authorization: {
        url: "https://accounts.spotify.com/authorize",
        params: {
          scope:
            "user-read-email playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      console.log("jwt callback", { token, account, user });
      if (account) {
        token.accessToken = {
          access_token: account.access_token,
          refresh_token: account.refresh_token,
        };
      }
      if (user) {
        token.user = user;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("session callback", { session, token });
      if (session.user) {
        session.user.id = session.user.id;
      }
      if (token.accessToken) {
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
});
