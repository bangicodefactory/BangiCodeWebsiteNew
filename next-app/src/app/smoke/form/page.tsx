/**
 * /smoke/forms — Verifies all form primitives from @bangicode/* registry.
 * BAN-129: install + verify Form primitives from Company brand registry.
 *
 * Covers: Input · Textarea · Select · Label · Checkbox · RadioGroup · Switch
 * Each shown in default / focus / error / disabled states.
 * Error colour uses text-destructive (tech red = tertiary) per DESIGN.md.
 * Focus ring: 2px ring-ring with 2px offset — pending IST-120 token wiring.
 * RTL section validates label alignment + input direction under dir="rtl".
 * Zod-validated form demonstrates FormMessage rendering under field.
 */

"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";

// ── Zod schema for the validation demo ───────────────────────────────────────
const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Enter a valid email address."),
  message: z.string().min(10, "Message must be at least 10 characters."),
  service: z.string().min(1, "Please select a service."),
  terms: z.boolean().refine((v) => v === true, {
    message: "You must accept the terms.",
  }),
});

type FormValues = z.infer<typeof schema>;

// ── Sub-component: Zod-wired demo form ───────────────────────────────────────
function ValidationDemo() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
      service: "",
      terms: false,
    },
  });

  function onSubmit(values: FormValues) {
    // Smoke only — no real submission
    console.log(values);
    alert("Form submitted (smoke only)");
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-md space-y-6"
        noValidate
      >
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input placeholder="Ahmed Chioua" {...field} />
              </FormControl>
              <FormDescription>Sentence case, no truncation.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Message */}
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your project…"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Service select */}
        <FormField
          control={form.control}
          name="service"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="software">Custom software</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="training">Technical training</SelectItem>
                  <SelectItem value="social">Social presence</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Terms checkbox */}
        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start gap-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Accept terms</FormLabel>
                <FormDescription>
                  You agree to our terms and privacy policy.
                </FormDescription>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" variant="primary" size="md">
          Submit (trigger validation)
        </Button>
      </form>
    </Form>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SmokeFormsPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-12 font-mono">
      <header className="mb-10 border-b border-gray-200 pb-6">
        <Link
          href="/smoke"
          className="mb-4 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700"
        >
          <ArrowLeft className="size-3" />
          Back to gallery
        </Link>
        <p className="mb-2 text-xs tracking-widest text-blue-600 uppercase">
          {"// _smoke / forms"}
        </p>
        <h1 className="text-2xl font-bold text-gray-900">
          @bangicode/form primitives — 8 components
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Input · Textarea · Select · Label · Checkbox · RadioGroup · Switch ·
          Form (RHF + Zod)
        </p>
      </header>

      {/* Token warning */}
      <section className="mb-10">
        <div className="space-y-1 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p>
            <strong>Tokens pending (IST-120):</strong>{" "}
            <code className="rounded bg-amber-100 px-1">ring-ring</code>,{" "}
            <code className="rounded bg-amber-100 px-1">border-input</code>,{" "}
            <code className="rounded bg-amber-100 px-1">text-destructive</code>{" "}
            resolve to browser defaults until the registry{" "}
            <code className="rounded bg-amber-100 px-1">@theme</code> is wired.
            Focus rings are invisible until then.
          </p>
        </div>
      </section>

      {/* Individual primitive states */}
      <section className="mb-12">
        <h2 className="mb-6 text-sm font-semibold tracking-widest text-gray-500 uppercase">
          Primitive states
        </h2>

        <div className="grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2">
          {/* Input */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-400">Input</p>
            <div className="space-y-2">
              <Label htmlFor="input-default">Default</Label>
              <Input id="input-default" placeholder="Placeholder" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="input-error">Error</Label>
              <Input
                id="input-error"
                aria-invalid
                defaultValue="bad@"
                placeholder="Error state"
              />
              <p className="font-hanken-grotesk text-destructive text-sm font-medium">
                Enter a valid email address.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="input-disabled">Disabled</Label>
              <Input id="input-disabled" disabled placeholder="Disabled" />
            </div>
          </div>

          {/* Textarea */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-400">Textarea</p>
            <div className="space-y-2">
              <Label htmlFor="textarea-default">Default</Label>
              <Textarea id="textarea-default" placeholder="Write here…" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="textarea-error">Error</Label>
              <Textarea
                id="textarea-error"
                aria-invalid
                defaultValue="too short"
                placeholder="Error"
              />
              <p className="font-hanken-grotesk text-destructive text-sm font-medium">
                Must be at least 10 characters.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="textarea-disabled">Disabled</Label>
              <Textarea
                id="textarea-disabled"
                disabled
                placeholder="Disabled"
              />
            </div>
          </div>

          {/* Select */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-400">Select</p>
            <div className="space-y-2">
              <Label htmlFor="select-default">Default</Label>
              <Select>
                <SelectTrigger id="select-default">
                  <SelectValue placeholder="Pick a service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="software">Custom software</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="training">Technical training</SelectItem>
                  <SelectItem value="social">Social presence</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Disabled</Label>
              <Select disabled>
                <SelectTrigger>
                  <SelectValue placeholder="Disabled" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="x">Option</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Checkbox + RadioGroup + Switch */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-400">
              Checkbox · RadioGroup · Switch
            </p>

            <div className="flex items-center gap-2">
              <Checkbox id="cb-default" />
              <Label htmlFor="cb-default">Unchecked</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="cb-checked" defaultChecked />
              <Label htmlFor="cb-checked">Checked</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="cb-disabled" disabled />
              <Label htmlFor="cb-disabled">Disabled</Label>
            </div>

            <RadioGroup defaultValue="software" className="mt-2">
              {["software", "ecommerce", "training"].map((v) => (
                <div key={v} className="flex items-center gap-2">
                  <RadioGroupItem value={v} id={`rg-${v}`} />
                  <Label htmlFor={`rg-${v}`} className="capitalize">
                    {v}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="mt-2 flex items-center gap-2">
              <Switch id="sw-off" />
              <Label htmlFor="sw-off">Off</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="sw-on" defaultChecked />
              <Label htmlFor="sw-on">On</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="sw-disabled" disabled />
              <Label htmlFor="sw-disabled">Disabled</Label>
            </div>
          </div>
        </div>
      </section>

      {/* Zod validation demo */}
      <section className="mb-12">
        <h2 className="mb-2 text-sm font-semibold tracking-widest text-gray-500 uppercase">
          Zod validation — submit empty to trigger errors
        </h2>
        <p className="mb-6 text-xs text-gray-400">
          Error messages render under the field via{" "}
          <code className="rounded bg-gray-100 px-1">{"<FormMessage />"}</code>{" "}
          in <code className="rounded bg-gray-100 px-1">text-destructive</code>{" "}
          (tech red per DESIGN.md §Components).
        </p>
        <ValidationDemo />
      </section>

      {/* RTL */}
      <section className="mb-12">
        <h2 className="mb-4 text-sm font-semibold tracking-widest text-gray-500 uppercase">
          RTL — dir=&quot;rtl&quot;
        </h2>
        <p className="mb-4 text-xs text-gray-400">
          Labels align to the inline-end side; inputs read right-to-left.
          Placeholder copy mirrors correctly.
        </p>
        <div
          dir="rtl"
          className="max-w-md space-y-4 rounded border border-dashed border-gray-200 p-4"
        >
          <div className="space-y-2">
            <Label htmlFor="rtl-name">الاسم الكامل</Label>
            <Input id="rtl-name" placeholder="أحمد شيوة" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rtl-message">الرسالة</Label>
            <Textarea id="rtl-message" placeholder="اكتب رسالتك هنا…" />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="rtl-terms" />
            <Label htmlFor="rtl-terms">أوافق على الشروط</Label>
          </div>
        </div>
      </section>

      <footer className="mt-12 border-t border-gray-100 pt-6 text-xs text-gray-400">
        BAN-129 · IST-120 (registry + token wiring) · BAN-146 (contact form
        consumer) · BAN-159 (cookie banner consumer)
      </footer>
    </main>
  );
}
