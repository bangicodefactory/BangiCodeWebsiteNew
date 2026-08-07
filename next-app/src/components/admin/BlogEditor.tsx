"use client";

import { useActionState, useState } from "react";
import { routing, type Locale } from "@/i18n/routing";
import { TextField, TextAreaField } from "@/components/admin/Field";
import { LocaleTabs } from "@/components/admin/LocaleTabs";
import {
  ActionBanner,
  DeletePanel,
  EditorHeader,
  PublishButton,
} from "@/components/admin/EditorChrome";
import {
  saveBlogPostAction,
  deleteBlogPostAction,
  type ActionState,
} from "@/app/admin/actions";
import type { BlogPostInput } from "@/lib/admin/content";
import { useFieldErrors } from "@/components/admin/useFieldErrors";

const LOCALE_LABELS: Record<string, string> = {
  en: "English",
  fr: "Français",
  ar: "العربية",
};

const IDLE: ActionState = { status: "idle" };

type LocaleField = "title" | "description" | "body";

/**
 * Every input here is CONTROLLED, and that is not a style preference.
 *
 * React 19 resets a <form action={…}> once the action resolves, exactly as a
 * native submission would. With uncontrolled inputs that meant a failed
 * validation wiped the form — someone could write a post in three languages,
 * hit publish, get "the Arabic description is missing", and find every field
 * blank. Holding the values in state makes a rejected submit non-destructive.
 */
export function BlogEditor({
  post,
  isNew,
  existingLocales,
}: {
  post: BlogPostInput;
  isNew: boolean;
  existingLocales?: string[];
}) {
  const [saveState, saveAction] = useActionState(saveBlogPostAction, IDLE);
  const [deleteState, deleteAction] = useActionState(
    deleteBlogPostAction,
    IDLE,
  );

  const [slug, setSlug] = useState(post.slug);
  const [date, setDate] = useState(post.date);
  const [content, setContent] = useState(post.content);

  const { errorFor, noteEdit, localeHasError } = useFieldErrors(saveState);

  function update(locale: Locale, key: LocaleField, value: string) {
    noteEdit(`content.${locale}.${key}`);
    setContent((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], [key]: value },
    }));
  }

  const status = Object.fromEntries(
    routing.locales.map((locale) => {
      const hasError = localeHasError(locale);
      const c = content[locale];
      const complete = Boolean(c.title && c.description && c.body);
      return [
        locale,
        hasError ? "error" : complete ? "complete" : "incomplete",
      ];
    }),
  ) as Record<string, "complete" | "incomplete" | "error">;

  return (
    <>
      <EditorHeader
        eyebrow={isNew ? "// new post" : "// edit post"}
        title={isNew ? "Write a post" : post.content.en.title || post.slug}
        backHref="/admin/blog"
        backLabel="All posts"
      />

      <ActionBanner state={saveState} />

      <form action={saveAction} className="flex flex-col gap-8">
        <input type="hidden" name="isNew" value={String(isNew)} />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TextField
            label="Slug"
            name="slug"
            value={slug}
            onChange={(e) => {
              noteEdit("slug");
              setSlug(e.target.value);
            }}
            // The slug is the URL and the filename in three places. Changing it
            // on an existing post would orphan the old files rather than move
            // them, so it is fixed after creation.
            readOnly={!isNew}
            required
            dir="ltr"
            spellCheck={false}
            hint={
              isNew
                ? "Lowercase, hyphens. Becomes /blog/<slug>."
                : "Fixed after creation."
            }
            error={errorFor("slug")}
          />
          <TextField
            label="Date"
            name="date"
            type="date"
            value={date}
            onChange={(e) => {
              noteEdit("date");
              setDate(e.target.value);
            }}
            required
            dir="ltr"
            error={errorFor("date")}
          />
        </div>

        <div>
          <p className="text-muted-foreground mb-3 font-mono text-xs">
            All three languages are required before a post can publish.
          </p>
          <LocaleTabs
            locales={routing.locales}
            labels={LOCALE_LABELS}
            status={status}
            renderPanel={(locale) => (
              <div className="flex flex-col gap-6">
                <TextField
                  label="Title"
                  name={`title.${locale}`}
                  value={content[locale].title}
                  onChange={(e) => update(locale, "title", e.target.value)}
                  dir={locale === "ar" ? "rtl" : "ltr"}
                  error={errorFor(`content.${locale}.title`)}
                />
                <TextField
                  label="Description"
                  name={`description.${locale}`}
                  value={content[locale].description}
                  onChange={(e) =>
                    update(locale, "description", e.target.value)
                  }
                  dir={locale === "ar" ? "rtl" : "ltr"}
                  hint="One sentence. Used on the index card and as the meta description."
                  error={errorFor(`content.${locale}.description`)}
                />
                <TextAreaField
                  label="Body (MDX)"
                  name={`body.${locale}`}
                  value={content[locale].body}
                  onChange={(e) => update(locale, "body", e.target.value)}
                  rows={18}
                  dir={locale === "ar" ? "rtl" : "ltr"}
                  className="font-mono text-sm"
                  hint="Markdown with JSX. Headings, lists, links and code fences all work."
                  error={errorFor(`content.${locale}.body`)}
                />
              </div>
            )}
          />
        </div>

        <div className="flex items-center gap-4">
          <PublishButton label={isNew ? "Create post" : "Save changes"} />
          <span className="text-muted-foreground font-mono text-xs">
            Saved to the database · live immediately
          </span>
        </div>
      </form>

      {!isNew ? (
        <DeletePanel
          kind="post"
          slug={post.slug}
          locales={existingLocales}
          action={deleteAction}
          state={deleteState}
        />
      ) : null}
    </>
  );
}
