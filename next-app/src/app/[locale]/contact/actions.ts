"use server";

export type ContactFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export async function submitContact(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // Honeypot check — bots fill this; humans leave it empty
  if (formData.get("website")) {
    return { status: "success" };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || name.length < 2) {
    return { status: "error", message: "invalid_name" };
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "invalid_email" };
  }
  if (!message || message.length < 10) {
    return { status: "error", message: "invalid_message" };
  }

  // TODO: wire up email delivery (Resend / SendGrid) in IST-146 follow-up
  await new Promise((r) => setTimeout(r, 400));

  return { status: "success" };
}
