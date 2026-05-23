"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function BookedToast() {
  const t = useTranslations("Booking");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("booked") !== "true") return;

    toast.success(t("booked.title"), {
      description: t("booked.description"),
      duration: 6000,
    });

    // Remove ?booked=true without triggering a navigation re-render.
    const url = new URL(window.location.href);
    url.searchParams.delete("booked");
    router.replace(url.pathname + (url.search || ""), { scroll: false });
  }, [searchParams, router, t]);

  return null;
}
