import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all routes except Next.js internals, Vercel internals,
  // the /smoke dev gallery, and static files (anything with an extension).
  matcher: ["/((?!_next|_vercel|smoke|.*\\..*).*)", "/"],
};
