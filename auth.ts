import NextAuth from "next-auth";
import { authConfig } from "./lib/auth";

// next-auth v5 default export is callable; TS resolution with bundler complains, so silence here.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export const { auth, signIn, signOut, handlers } = NextAuth(authConfig);
