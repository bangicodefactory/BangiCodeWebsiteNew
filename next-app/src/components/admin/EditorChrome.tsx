"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/admin/Field";
import type { ActionState } from "@/app/admin/actions";

/** Publish button that reflects the in-flight state of its own form. */
export function PublishButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="spark" size="lg" disabled={pending}>
      {pending ? (
        <>
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          Publishing…
        </>
      ) : (
        label
      )}
    </Button>
  );
}

/**
 * Result banner for a save.
 *
 * On success it links the commit. Publishing here does not make the change live
 * — the site rebuilds from that commit — so the banner says so plainly rather
 * than letting the editor assume the post is already on bangicode.ma.
 */
export function ActionBanner({ state }: { state: ActionState }) {
  if (state.status === "idle") return null;

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="border-success bg-card text-foreground mb-6 flex items-start gap-3 rounded-sm border-s-2 p-4"
      >
        <CheckCircle2
          aria-hidden="true"
          className="text-success mt-0.5 size-4 shrink-0"
        />
        <div>
          <p className="font-body text-sm font-medium">{state.message}</p>
          <p className="font-body text-muted-foreground mt-1 text-sm leading-relaxed">
            Saved and live on the site — no deploy needed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="border-destructive bg-card text-foreground mb-6 flex items-start gap-3 rounded-sm border-s-2 p-4"
    >
      <AlertTriangle
        aria-hidden="true"
        className="text-destructive mt-0.5 size-4 shrink-0"
      />
      <p className="font-body text-sm leading-relaxed">{state.message}</p>
    </div>
  );
}

/**
 * Delete control. Requires typing the slug — the same pattern GitHub uses for
 * repository deletion, and for the same reason: this is irreversible from the
 * CMS's point of view, and a stray click should not be enough. (The content is
 * recoverable from git history, which the copy says so nobody panics.)
 */
export function DeletePanel({
  slug,
  locales,
  action,
  state,
  kind,
}: {
  slug: string;
  locales?: string[];
  action: (formData: FormData) => void;
  state: ActionState;
  kind: "post" | "project";
}) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");

  return (
    <div className="border-border mt-12 border-t pt-8">
      <h2 className="font-display text-foreground text-lg font-bold tracking-tight">
        Delete this {kind}
      </h2>
      <p className="font-body text-muted-foreground mt-2 max-w-prose text-sm leading-relaxed">
        Removes every locale in a single commit. The content stays in the
        repository&apos;s history and can be restored from git.
      </p>

      {!open ? (
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(true)}
            aria-expanded={false}
          >
            Delete {kind}
          </Button>
        </div>
      ) : (
        <form action={action} className="mt-4 max-w-md">
          <input type="hidden" name="slug" value={slug} />
          {locales ? (
            <input type="hidden" name="locales" value={locales.join(",")} />
          ) : null}
          <TextField
            label={`Type "${slug}" to confirm`}
            name="confirm"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            dir="ltr"
          />
          {state.status === "error" ? (
            <p role="alert" className="text-destructive mt-2 font-mono text-xs">
              {state.message}
            </p>
          ) : null}
          <div className="mt-4 flex gap-3">
            <Button
              type="submit"
              variant="destructive"
              disabled={typed !== slug}
            >
              Delete permanently
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setOpen(false);
                setTyped("");
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export function EditorHeader({
  eyebrow,
  title,
  backHref,
  backLabel,
}: {
  eyebrow: string;
  title: string;
  backHref: string;
  backLabel: string;
}) {
  return (
    <div className="mb-8">
      <Link
        href={backHref}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-sm font-mono text-xs tracking-widest uppercase underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
      >
        ← {backLabel}
      </Link>
      <p
        dir="ltr"
        className="text-muted-foreground mt-6 font-mono text-xs tracking-widest uppercase"
      >
        {eyebrow}
      </p>
      <h1 className="font-display text-foreground mt-2 text-2xl font-bold tracking-tight">
        {title}
      </h1>
    </div>
  );
}
