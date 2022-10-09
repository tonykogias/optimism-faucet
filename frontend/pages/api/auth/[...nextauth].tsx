/* External Imports */
import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import {GithubProfile} from "next-auth/providers/github";

export default NextAuth({
  providers: [
    // Github OAuth provider
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
  ],
  pages: {
    // On error, return to home
    error: "/",
  },
  session: {
    // 30 day expiry
    maxAge: 30 * 24 * 60 * 60,
    // Refresh JWT on each login
    updateAge: 0,
  },
  jwt: {
    // JWT secret
    secret: process.env.JWT_SECRET ?? "",
  },
  callbacks: {
    // Running when use signin/signout
    async jwt({ token, user, profile }) {
      const isSignIn = !!user;
      if (isSignIn) {
        const _profile: GithubProfile = profile as GithubProfile;
        token.github_id = user?.id;
        token.github_name = _profile?.login;
        token.github_following = _profile?.following;
        token.github_created_at = _profile?.created_at;
      }

      // Resolve JWT
      return Promise.resolve(token);
    },

    // Running when we want to retrieve the session e.g. when calling `getSession()`
    async session({ session, token }) {
      const _session = session as any;
      // Attach additional params from JWT to session
      _session.github_id = token.github_id;
      _session.github_name = token.github_name;
      _session.github_following = token.github_following;
      _session.github_created_at = token.github_created_at;
      // Resolve session
      return Promise.resolve(_session);
    },
  },
});
