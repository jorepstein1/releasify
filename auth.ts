import NextAuth, { type User, type Account } from "next-auth";
import { getToken, type JWT } from "next-auth/jwt";
import Spotify from "next-auth/providers/spotify";
import { performTokenRefresh } from "./app/spotifyApi";

declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    access_token?: string;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    user: User;
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
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
        // first time log in
        token = {
          ...token,
          access_token: account.access_token,
          refresh_token: account.refresh_token,
          expires_at: account.expires_at,
        };
        if (user) {
          token.user = user;
        }
        return token;
      }
      return token;
    },
    async session({ session, token, user }) {
      console.log("session callback", { session, token });

      if (token.refresh_token) {
        if (!token.expires_at || Date.now() >= token.expires_at * 1000) {
          console.log("Refreshing token");
          let newToken = await performTokenRefresh(token.refresh_token);
          token.access_token = newToken.access_token;
          token.refresh_token = newToken.refresh_token;
          token.expires_at = newToken.expires_at;
        }
      }

      if (token.user) {
        session.user = {
          ...token.user,
          ...user,
        };
      }
      if (token.access_token) {
        session.access_token = token.access_token;
      }
      return session;
    },
  },
});
