"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { trackContactFormSubmit } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitContact, type ContactFormState } from "./actions";

const initialState: ContactFormState = { status: "idle" };

const SERVICES = [
  { value: "software", key: "formServiceSoftware" },
  { value: "ecommerce", key: "formServiceEcommerce" },
  { value: "training", key: "formServiceTraining" },
  { value: "social", key: "formServiceSocial" },
  { value: "other", key: "formServiceOther" },
] as const;

export function ContactForm() {
  const t = useTranslations("Contact");
  const [state, formAction, isPending] = useActionState(
    submitContact,
    initialState,
  );
  const [selectedService, setSelectedService] = useState("");
  const trackFiredRef = useRef(false);

  useEffect(() => {
    if (state.status === "success" && !trackFiredRef.current) {
      trackFiredRef.current = true;
      trackContactFormSubmit(selectedService || "unknown");
    }
  }, [state.status, selectedService]);

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="bg-surface-container rounded-sm p-8 text-center"
      >
        <p className="font-body text-foreground mb-4 text-base">
          {t("formSuccess")}
        </p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => window.location.reload()}
        >
          {t("formReset")}
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-6">
      {/* Honeypot — hidden from humans, filled by bots */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="sr-only"
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-name">{t("formName")}</Label>
          <Input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder={t("formNamePlaceholder")}
            required
            minLength={2}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-email">{t("formEmail")}</Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={t("formEmailPlaceholder")}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {/*
         * Marking the one OPTIONAL field, not the three required ones.
         *
         * `required` was already on name/email/message in the DOM, but the form
         * sets noValidate and nothing was marked visually, so the only way to
         * learn what was mandatory was to submit and fail. When required fields
         * outnumber optional ones, three asterisks read as noise and an
         * "(optional)" on the single exception carries the same information.
         * It is part of the label element, so screen readers get it too.
         */}
        <Label htmlFor="contact-service-trigger">
          {t("formService")}{" "}
          <span className="text-muted-foreground font-normal">
            {t("formOptional")}
          </span>
        </Label>
        <Select name="service" onValueChange={setSelectedService}>
          <SelectTrigger id="contact-service-trigger">
            <SelectValue placeholder={t("formServicePlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {SERVICES.map(({ value, key }) => (
              <SelectItem key={value} value={value}>
                {t(key)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="contact-message">{t("formMessage")}</Label>
        <Textarea
          id="contact-message"
          name="message"
          rows={5}
          placeholder={t("formMessagePlaceholder")}
          required
          minLength={10}
        />
      </div>

      {state.status === "error" && (
        <p role="alert" className="text-destructive font-mono text-sm">
          {t("formError")}
        </p>
      )}

      {/*
       * spark, not primary. Every other "do the thing" button on the site is
       * the red pill — nav, hero, "Book 30 min". This one is the last step of
       * the funnel those buttons feed, and it was the quietest button on the
       * page. The ~5% red rule is about area, and one submit button on an
       * otherwise light form is well inside it.
       */}
      <Button
        type="submit"
        variant="spark"
        size="lg"
        disabled={isPending}
        className="self-start"
      >
        {isPending ? t("formSubmitting") : t("formSubmit")}
      </Button>
    </form>
  );
}
