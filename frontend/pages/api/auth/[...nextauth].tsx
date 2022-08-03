/* External Imports */
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export default NextAuth({
  providers: [
    // Github OAuth provider
    GitHub({
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
        token.github_id = user?.id;
        token.github_name = profile?.login;
        token.github_following = profile?.following;
        token.github_created_at = profile?.created_at;
      }

      // Resolve JWT
      return Promise.resolve(token);
    },

    // Running when we want to retrieve the session e.g. when calling `getSession()`
    async session({ session, token }) {
      // Attach additional params from JWT to session
      session.github_id = token.github_id;
      session.github_name = token.github_name;
      session.github_following = token.github_following;
      session.github_created_at = token.github_created_at;
      // Resolve session
      return Promise.resolve(session);
    },
  },
});
