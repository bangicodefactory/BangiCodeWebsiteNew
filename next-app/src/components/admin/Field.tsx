"use client";

import { useId, type ReactNode } from "react";
import { Input, type InputProps } from "@/components/ui/input";
import { Textarea, type TextareaProps } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

/**
 * A labelled form control with hint and error slots.
 *
 * The error is wired with `aria-describedby` and `aria-invalid` rather than
 * just being red text — a colour-only error is invisible to a screen reader and
 * to anyone who cannot distinguish it.
 */
function FieldFrame({
  id,
  label,
  hint,
  error,
  dir,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  dir?: "ltr" | "rtl";
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5" dir={dir}>
      <Label
        htmlFor={id}
        className="font-mono text-xs tracking-wider uppercase"
      >
        {label}
      </Label>
      {children}
      {hint && !error ? (
        <p
          id={`${id}-hint`}
          className="text-muted-foreground font-mono text-xs"
        >
          {hint}
        </p>
      ) : null}
      {/*
       * No role="alert" here, deliberately. The field is already announced via
       * aria-invalid + aria-describedby when focused, and the summary banner
       * above the form is the single live region. Making every field an alert
       * meant a rejected submit fired four or five simultaneous announcements,
       * which is noise rather than information.
       */}
      {error ? (
        <p id={`${id}-error`} className="text-destructive font-mono text-xs">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({
  label,
  hint,
  error,
  dir,
  ...props
}: InputProps & {
  label: string;
  hint?: string;
  error?: string;
  dir?: "ltr" | "rtl";
}) {
  const generated = useId();
  const id = props.id ?? generated;
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} dir={dir}>
      <Input
        {...props}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
      />
    </FieldFrame>
  );
}

export function TextAreaField({
  label,
  hint,
  error,
  dir,
  ...props
}: TextareaProps & {
  label: string;
  hint?: string;
  error?: string;
  dir?: "ltr" | "rtl";
}) {
  const generated = useId();
  const id = props.id ?? generated;
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} dir={dir}>
      <Textarea
        {...props}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
      />
    </FieldFrame>
  );
}

export function SelectField({
  label,
  hint,
  error,
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hint?: string;
  error?: string;
  options: ReadonlyArray<{ value: string; label: string }>;
}) {
  const generated = useId();
  const id = props.id ?? generated;
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error}>
      {/*
       * A native <select>, not the Radix one in ui/select.tsx. Radix's select
       * renders a button + portal and contributes no value to a plain form
       * submission, which is the whole basis of this editor — everything posts
       * as FormData with no client serialisation.
       */}
      <select
        {...props}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
        className="border-input bg-card text-foreground focus-visible:ring-ring h-10 w-full rounded-sm border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldFrame>
  );
}
