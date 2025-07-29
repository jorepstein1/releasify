import NextAuth, { type User, type Session } from "next-auth";
import { type JWT } from "next-auth/jwt";
import Spotify from "next-auth/providers/spotify";

interface AccessToken {
  accessToken?: string;
  refreshToken?: string;
}
declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    accessToken: AccessToken;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    user: User;
    accessToken?: AccessToken;
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
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
        };
      }
      token.user = user;
      return token;
    },
    async session({ session, token, user }) {
      console.log("session callback", { session, token });
      if (token.user) {
        session.user = {
          ...token.user,
          ...user,
        };
      }
      if (token.accessToken) {
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
});
