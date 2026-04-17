import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/index.server";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { env } from "../env";
import { createAuthMiddleware } from "better-auth/api";
import * as schema from "./db/schema.server";

const ALLOWED_DOMAINS = ["testsprite.com"];
const ALLOWED_EMAILS = ["bykaelren@gmail.com"];

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  onAPIError: {
    errorURL: "/auth/error",
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path.startsWith("/callback/")) {
        const newSession = ctx.context.newSession;
        if (!newSession?.user?.email) {
          return;
        }
        const email = newSession.user.email.toLowerCase();
        const emailDomain = email.split("@")[1];
        const isDomainAllowed = ALLOWED_DOMAINS.includes(emailDomain);
        const isEmailAllowed = ALLOWED_EMAILS.includes(email);
        if (!isDomainAllowed && !isEmailAllowed) {
          await ctx.context.internalAdapter.deleteUser(newSession.user.id);
          const errorURL = ctx.context.options.onAPIError?.errorURL;
          throw ctx.redirect(
            `${errorURL}?error=email_not_allowed&message=Email+address+not+allowed`,
          );
        }
      }
    }),
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
  },
  plugins: [tanstackStartCookies()],
});
