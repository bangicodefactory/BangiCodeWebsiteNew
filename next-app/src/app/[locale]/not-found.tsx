import Link from "next/link";
import { Button } from "@/components/ui/button";

/*
 * 404 boundary for everything under [locale].
 *
 * Without this file, a notFound() thrown anywhere in the locale tree — an
 * unknown case study, platform or blog slug — falls through to the ROOT
 * not-found, which renders its own <html> outside the locale layout. That is
 * why the site's 404s arrived as a bare monospace line with no nav, no footer
 * and no tokens.
 *
 * It also cost a CI failure: `/en/blog/not-a-post` returned 500 rather than 404
 * on the runner while passing locally. That route is the only one whose
 * generateStaticParams returns an EMPTY array (there are no posts yet), and on
 * the artifact-restored build it resolved the root boundary differently.
 * Giving the locale segment its own not-found removes the dependency entirely
 * rather than relying on the root one behaving identically everywhere.
 *
 * Deliberately no useTranslations: a not-found boundary can render in contexts
 * where the locale has not been established, and a 404 page that itself throws
 * is considerably worse than one that is only in English.
 *
 * For the same reason the links are plain next/link, NOT next-intl's. This file
 * used the localised Link while claiming to need no locale, and that was a live
 * contradiction: the localised Link resolves the current locale, which without
 * an established request locale means reading headers. Any path the i18n
 * middleware skips — its matcher excludes anything containing a dot — reached
 * the [locale] segment with a junk locale, hit notFound(), rendered this
 * boundary, and turned a static render dynamic. `/nope.txt`, `/old-page.html`
 * and every bot probe for `/wp-login.php` answered 500 instead of 404.
 *
 * Unprefixed hrefs are correct here: the middleware redirects `/` and
 * `/portfolio` to the visitor's locale, which is the right answer when this
 * page cannot know what that locale is.
 */
export default function LocaleNotFound() {
  return (
    <div className="max-w-content mx-auto flex flex-col items-center justify-center px-4 py-32 text-center sm:px-6">
      <p
        dir="ltr"
        className="text-muted-foreground font-mono text-xs tracking-widest uppercase"
      >
        {"// 404"}
      </p>
      <h1 className="font-display text-foreground mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
        This page doesn&apos;t exist.
      </h1>
      <p className="font-body text-muted-foreground mt-4 max-w-md text-base leading-relaxed">
        The link may be out of date, or the page may have moved.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild variant="spark">
          <Link href="/">Back to the homepage</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/portfolio">See our work</Link>
        </Button>
      </div>
    </div>
  );
}
