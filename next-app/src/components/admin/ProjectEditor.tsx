"use client";

import { useActionState, useState } from "react";
import { routing, type Locale } from "@/i18n/routing";
import { PROJECT_CATEGORIES, type Project } from "@/lib/portfolio-schema";
import {
  TextField,
  TextAreaField,
  SelectField,
} from "@/components/admin/Field";
import { LocaleTabs } from "@/components/admin/LocaleTabs";
import {
  ActionBanner,
  DeletePanel,
  EditorHeader,
  PublishButton,
} from "@/components/admin/EditorChrome";
import {
  saveProjectAction,
  deleteProjectAction,
  type ActionState,
} from "@/app/admin/actions";
import { useFieldErrors } from "@/components/admin/useFieldErrors";

const LOCALE_LABELS: Record<string, string> = {
  en: "English",
  fr: "Français",
  ar: "العربية",
};

const IDLE: ActionState = { status: "idle" };

const CATEGORY_OPTIONS = PROJECT_CATEGORIES.map((c) => ({
  value: c,
  label: c,
}));

type LocaleField = "name" | "summary" | "outcome";

/**
 * Controlled throughout — see the note in BlogEditor. React 19 resets a
 * <form action={…}> after the action resolves, so uncontrolled fields would
 * discard the author's work every time validation rejected a submit.
 */
export function ProjectEditor({
  project,
  isNew,
}: {
  project: Project;
  isNew: boolean;
}) {
  const [saveState, saveAction] = useActionState(saveProjectAction, IDLE);
  const [deleteState, deleteAction] = useActionState(deleteProjectAction, IDLE);

  const [meta, setMeta] = useState({
    slug: project.slug,
    category: project.category as string,
    date: project.date,
    order: String(project.order),
    tags: project.tags.join(", "),
    heroAlt: project.hero.alt,
  });
  const [content, setContent] = useState(project.content);

  const { errorFor, noteEdit, localeHasError } = useFieldErrors(saveState);

  function update(locale: Locale, key: LocaleField, value: string) {
    noteEdit(`content.${locale}.${key}`);
    setContent((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], [key]: value },
    }));
  }

  function setMetaField(key: keyof typeof meta, value: string) {
    noteEdit(key === "heroAlt" ? "hero.alt" : key);
    setMeta((prev) => ({ ...prev, [key]: value }));
  }

  const status = Object.fromEntries(
    routing.locales.map((locale) => {
      const hasError = localeHasError(locale);
      const c = content[locale];
      const complete = Boolean(c.name && c.summary && c.outcome);
      return [
        locale,
        hasError ? "error" : complete ? "complete" : "incomplete",
      ];
    }),
  ) as Record<string, "complete" | "incomplete" | "error">;

  return (
    <>
      <EditorHeader
        eyebrow={isNew ? "// new project" : "// edit project"}
        title={
          isNew ? "Add a project" : project.content.en.name || project.slug
        }
        backHref="/admin/portfolio"
        backLabel="All projects"
      />

      <ActionBanner state={saveState} />

      <form action={saveAction} className="flex flex-col gap-8">
        <input type="hidden" name="isNew" value={String(isNew)} />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TextField
            label="Slug"
            name="slug"
            value={meta.slug}
            onChange={(e) => setMetaField("slug", e.target.value)}
            readOnly={!isNew}
            required
            dir="ltr"
            spellCheck={false}
            hint={
              isNew
                ? "Lowercase, hyphens. Becomes /portfolio/<slug>."
                : "Fixed after creation."
            }
            error={errorFor("slug")}
          />
          <SelectField
            label="Practice"
            name="category"
            value={meta.category}
            onChange={(e) => setMetaField("category", e.target.value)}
            options={CATEGORY_OPTIONS}
            hint="Drives the filter on the portfolio index."
            error={errorFor("category")}
          />
          <TextField
            label="Date"
            name="date"
            value={meta.date}
            onChange={(e) => setMetaField("date", e.target.value)}
            required
            dir="ltr"
            hint="Free text — e.g. 2024, 2022–2023, 2023–present."
            error={errorFor("date")}
          />
          <TextField
            label="Order"
            name="order"
            type="number"
            min={1}
            value={meta.order}
            onChange={(e) => setMetaField("order", e.target.value)}
            required
            dir="ltr"
            hint="Position on the portfolio index. Lower shows first."
            error={errorFor("order")}
          />
          <div className="sm:col-span-2">
            <TextField
              label="Tech stack"
              name="tags"
              value={meta.tags}
              onChange={(e) => setMetaField("tags", e.target.value)}
              required
              dir="ltr"
              hint="Comma-separated — e.g. Laravel, Next.js, Stripe."
              error={errorFor("tags")}
            />
          </div>
          <div className="sm:col-span-2">
            <TextField
              label="Hero image alt text"
              name="heroAlt"
              value={meta.heroAlt}
              onChange={(e) => setMetaField("heroAlt", e.target.value)}
              dir="ltr"
              hint="Describes the screenshot. Unused while the hero is a placeholder; defaults to the project name."
              error={errorFor("hero.alt")}
            />
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-3 font-mono text-xs">
            All three languages are required — a project cannot publish in one
            locale only.
          </p>
          <LocaleTabs
            locales={routing.locales}
            labels={LOCALE_LABELS}
            status={status}
            renderPanel={(locale) => (
              <div className="flex flex-col gap-6">
                <TextField
                  label="Client / project name"
                  name={`name.${locale}`}
                  value={content[locale].name}
                  onChange={(e) => update(locale, "name", e.target.value)}
                  dir={locale === "ar" ? "rtl" : "ltr"}
                  error={errorFor(`content.${locale}.name`)}
                />
                <TextAreaField
                  label="Summary"
                  name={`summary.${locale}`}
                  value={content[locale].summary}
                  onChange={(e) => update(locale, "summary", e.target.value)}
                  rows={3}
                  dir={locale === "ar" ? "rtl" : "ltr"}
                  hint="One or two sentences. Shown on the portfolio card."
                  error={errorFor(`content.${locale}.summary`)}
                />
                <TextAreaField
                  label="Outcome"
                  name={`outcome.${locale}`}
                  value={content[locale].outcome}
                  onChange={(e) => update(locale, "outcome", e.target.value)}
                  rows={3}
                  dir={locale === "ar" ? "rtl" : "ltr"}
                  hint="The measurable result. Concrete numbers where you have them."
                  error={errorFor(`content.${locale}.outcome`)}
                />
              </div>
            )}
          />
        </div>

        <div className="flex items-center gap-4">
          <PublishButton label={isNew ? "Create project" : "Save changes"} />
          <span className="text-muted-foreground font-mono text-xs">
            Saved to the database · live immediately
          </span>
        </div>
      </form>

      {!isNew ? (
        <DeletePanel
          kind="project"
          slug={project.slug}
          action={deleteAction}
          state={deleteState}
        />
      ) : null}
    </>
  );
}
