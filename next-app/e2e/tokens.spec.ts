import { test, expect } from "@playwright/test";

/**
 * Design token integrity — @smoke
 *
 * This suite exists because of a real, long-lived production bug: globals.css
 * shipped an empty `@theme {}` block deferring to a `@bangicode` registry that
 * was never deployed, so EVERY brand class in the codebase (bg-primary,
 * text-foreground, text-muted-foreground, border-border, …) compiled to nothing
 * and the site rendered as black text on white.
 *
 * Tailwind emits no warning for an undefined colour token — the element just
 * renders unstyled. Nothing in the build, typecheck, lint or the existing smoke
 * suite caught it. These assertions do.
 *
 * See docs/adr/0001-adopt-claude-design-system-tokens.md
 */

/**
 * Utility classes with the most call sites — a miss here is a visible regression.
 *
 * These are asserted by rendering a probe element and reading its computed
 * style, NOT by reading `--color-*` off :root. That is deliberate: the bridge
 * in tokens.css uses `@theme inline`, which by design does not emit `--color-*`
 * custom properties at all — it inlines the var() reference into each utility.
 * Probing a real element tests the whole chain instead: the utility was
 * generated, its variable is defined, and it resolves to a real colour.
 */
const REQUIRED_CLASSES: Array<{
  cls: string;
  prop: "backgroundColor" | "color" | "borderColor";
}> = [
  { cls: "bg-background", prop: "backgroundColor" },
  { cls: "text-foreground", prop: "color" }, // 78 uses
  { cls: "text-muted-foreground", prop: "color" }, // 101 uses
  { cls: "border-border", prop: "borderColor" }, // 36 uses
  { cls: "bg-primary", prop: "backgroundColor" },
  { cls: "text-primary-foreground", prop: "color" }, // 26 uses
  { cls: "text-secondary-container", prop: "color" }, // 23 uses, overloaded
  { cls: "bg-surface-container", prop: "backgroundColor" },
  { cls: "bg-primary-container", prop: "backgroundColor" },
  { cls: "text-accent", prop: "color" },
  { cls: "text-destructive", prop: "color" },
];

/** Brand anchors, which are also the fills inside brand/logo.svg. */
const BRAND_ANCHORS: Record<string, string> = {
  "--color-navy-700": "#114483",
  "--color-sky-500": "#2e91ce",
  "--color-red-500": "#d30f33",
};

function rgbToHex(rgb: string): string {
  const m = rgb.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (!m) return rgb.trim().toLowerCase();
  return (
    "#" +
    [m[1], m[2], m[3]]
      .map((n) => Number(n).toString(16).padStart(2, "0"))
      .join("")
  );
}

test("@smoke design tokens — brand utility classes resolve to real colours", async ({
  page,
}) => {
  await page.goto("/en");

  const results = await page.evaluate((specs) => {
    return specs.map(({ cls, prop }) => {
      const el = document.createElement("div");
      el.className = cls;
      // borderColor only computes meaningfully with a border-style set
      el.style.borderStyle = "solid";
      el.style.borderWidth = "1px";
      document.body.appendChild(el);
      const value = getComputedStyle(el)[prop as "color"];
      el.remove();
      return { cls, value };
    });
  }, REQUIRED_CLASSES);

  // An undeclared token yields a transparent / initial value rather than an error.
  const dead = results.filter(
    ({ value }) =>
      !value ||
      value === "rgba(0, 0, 0, 0)" ||
      value === "transparent" ||
      value === "initial",
  );

  expect(
    dead.map((d) => d.cls),
    `These brand classes compile to nothing and render unstyled: ` +
      `${dead.map((d) => d.cls).join(", ")}. ` +
      `Declare the token in src/styles/tokens.css and make sure the ` +
      `@theme inline bridge maps --color-<name> to it.`,
  ).toEqual([]);
});

test("@smoke design tokens — brand anchors match brand/logo.svg", async ({
  page,
}) => {
  await page.goto("/en");

  const resolved = await page.evaluate((names) => {
    const cs = getComputedStyle(document.documentElement);
    return Object.fromEntries(
      names.map((n) => [n, cs.getPropertyValue(n).trim()]),
    );
  }, Object.keys(BRAND_ANCHORS));

  for (const [token, expected] of Object.entries(BRAND_ANCHORS)) {
    expect(
      rgbToHex(resolved[token]),
      `${token} drifted from the brand logo colour`,
    ).toBe(expected);
  }
});

test("@smoke design tokens — page is actually painted, not Tailwind defaults", async ({
  page,
}) => {
  await page.goto("/en");

  const { bg, fg } = await page.evaluate(() => {
    const cs = getComputedStyle(document.body);
    return { bg: cs.backgroundColor, fg: cs.color };
  });

  // The regression state was a pure-white body with pure-black text.
  expect(rgbToHex(bg), "body background is unstyled white").not.toBe("#ffffff");
  expect(rgbToHex(fg), "body text is unstyled black").not.toBe("#000000");
});

test("@smoke design tokens — data-surface=dark re-points the semantic layer", async ({
  page,
}) => {
  await page.goto("/en");

  // Design D's navy bands rely on this: wrapping a section in
  // data-surface="dark" must flip the semantic tokens so existing components
  // (written in light-surface semantics) render correctly on navy.
  const { light, dark } = await page.evaluate(() => {
    const probe = document.createElement("div");
    probe.setAttribute("data-surface", "dark");
    document.body.appendChild(probe);
    const dark = getComputedStyle(probe)
      .getPropertyValue("--foreground")
      .trim();
    probe.remove();
    const light = getComputedStyle(document.documentElement)
      .getPropertyValue("--foreground")
      .trim();
    return { light, dark };
  });

  expect(light, "--foreground undefined on the light surface").not.toBe("");
  expect(dark, "--foreground undefined under data-surface=dark").not.toBe("");
  expect(
    dark,
    "data-surface=dark did not override --foreground — dark bands will render " +
      "dark-on-dark. Check the [data-surface='dark'] block in tokens.css and " +
      "that the bridge uses `@theme inline`.",
  ).not.toBe(light);
});

/*
 * Fonts.
 *
 * This has silently broken twice, in the same way: `@theme inline` INLINES its
 * value into the utility, so `.font-display` compiles to
 * `font-family: var(--font-montserrat)`. A rule that merely reassigns
 * `--font-display` therefore never reaches it, and Tailwind drops the rule.
 *
 * That is why `[lang="ar"] { --font-display: … }` was dead: Arabic pages
 * rendered in a Latin face and fell back to a system font for Arabic glyphs.
 * Stacks are now indirected through --font-*-stack. These assertions hold that.
 */

test("@smoke fonts — display/body/mono stacks all resolve", async ({
  page,
}) => {
  await page.goto("/en");

  const stacks = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return {
      display: cs.getPropertyValue("--font-display-stack").trim(),
      body: cs.getPropertyValue("--font-body-stack").trim(),
      mono: cs.getPropertyValue("--font-mono-stack").trim(),
      bodyComputed: getComputedStyle(document.body).fontFamily,
    };
  });

  expect(stacks.display, "--font-display-stack unresolved").not.toBe("");
  expect(stacks.body, "--font-body-stack unresolved").not.toBe("");
  expect(stacks.mono, "--font-mono-stack unresolved").not.toBe("");

  // next/font emits generated family names; an unresolved var leaves this empty.
  expect(
    stacks.bodyComputed,
    "body has no resolved font-family — the bridge is broken",
  ).not.toBe("");
});

test("@smoke fonts — /ar swaps BOTH display and body to the Arabic face", async ({
  page,
}) => {
  await page.goto("/ar");

  const ar = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return {
      display: cs.getPropertyValue("--font-display-stack").trim(),
      body: cs.getPropertyValue("--font-body-stack").trim(),
      arabicVar: cs.getPropertyValue("--font-plex-arabic").trim(),
    };
  });

  expect(
    ar.arabicVar,
    "--font-plex-arabic is not set on /ar — check the next/font instance in layout.tsx",
  ).not.toBe("");

  // Both stacks must land on the Arabic family. Body is the one that regressed
  // before: Manrope has no Arabic glyphs, so body copy fell back to a system font.
  expect(ar.display, "Arabic display font not applied on /ar").toBe(
    ar.arabicVar,
  );
  expect(
    ar.body,
    "Arabic BODY font not applied on /ar — Arabic body copy will fall back to a system font",
  ).toBe(ar.arabicVar);
});

test("@smoke fonts — /en does NOT get the Arabic face", async ({ page }) => {
  await page.goto("/en");

  const en = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    return {
      body: cs.getPropertyValue("--font-body-stack").trim(),
      arabicVar: cs.getPropertyValue("--font-plex-arabic").trim(),
    };
  });

  // preload:false + the locale-conditional class means /en should never load it.
  expect(
    en.body === en.arabicVar && en.arabicVar !== "",
    "/en is using the Arabic font stack",
  ).toBe(false);
});

/*
 * Hover and press must actually animate.
 *
 * Every interactive element was written as `transition-[…,transform]`, which
 * is what Tailwind v3 required. v4 does not emit `transform` for these
 * utilities — `-translate-y-px` compiles to the `translate` property and
 * `scale-[0.98]` to `scale`. Naming only `transform` therefore transitioned
 * something nothing sets, so every button and card LIFTED AND PRESSED
 * INSTANTLY while its colour faded smoothly over 200ms.
 *
 * Nothing caught it: it type-checks, it lints, the class string looks correct,
 * and Lighthouse does not measure whether a hover eases. Only reading the
 * computed style, or noticing the site felt cheap, would find it.
 *
 * Asserting on the computed `transition-property` is the cheap durable check.
 * The mid-flight sample below is the honest one — a transition can be declared
 * and still not run.
 */
test("@smoke interactive elements animate their movement, not just their colour", async ({
  page,
}) => {
  await page.goto("/en");

  const targets = [
    ["primary CTA", page.getByRole("link", { name: /start a project/i })],
    ["service card", page.locator('main a[href*="/services/"]')],
  ] as const;

  for (const [label, locator] of targets) {
    const el = locator.first();
    await el.waitFor();
    const property = await el.evaluate(
      (n) => getComputedStyle(n).transitionProperty,
    );
    // Both, not either: the lift uses `translate` and the press uses `scale`.
    expect(property, `${label} must transition translate`).toContain(
      "translate",
    );
    expect(property, `${label} must transition scale`).toContain("scale");
  }
});

test("@smoke a hover eases rather than snapping", async ({ page }) => {
  await page.goto("/en");

  const btn = page.getByRole("link", { name: /start a project/i }).first();
  await btn.waitFor();
  const box = await btn.boundingBox();
  expect(box).not.toBeNull();

  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);

  /*
   * Sample the translate repeatedly during the transition. A declared-but-dead
   * transition jumps straight to its end value, so the samples collapse to two
   * distinct readings; a live one passes through intermediate positions.
   *
   * This is timing-sensitive by construction — six samples 30ms apart across a
   * 200ms transition. The threshold is deliberately loose (more than two
   * distinct values, not a specific count) so a loaded CI runner that misses
   * some samples still passes. If it ever flakes, raise the sample count
   * rather than lowering the threshold: at two, the test stops distinguishing
   * an easing transition from a snapping one, which is the whole point.
   */
  const seen = new Set<string>();
  for (let i = 0; i < 6; i++) {
    seen.add(await btn.evaluate((n) => getComputedStyle(n).translate));
    await page.waitForTimeout(30);
  }

  expect(
    seen.size,
    `expected intermediate positions, saw only: ${[...seen].join(" | ")}`,
  ).toBeGreaterThan(2);
});

/*
 * The hero grid lights under the pointer and follows it.
 *
 * The value of this test is mostly the LAST assertion. The lit layer is a
 * client component sitting in the LCP band, and the base grid it sits over is a
 * server-rendered CSS background with no JavaScript. If someone ever "tidies"
 * the two into one client component, the hero would render its texture only
 * after hydration — invisible in review, and a direct hit on an LCP budget that
 * is CI-enforced at under 2.0s. So this asserts the base grid is still in the
 * SERVED HTML, not merely in the live DOM.
 *
 * The alignment assertion matters too: the two grids must share an 80px cell or
 * the lit lines sit beside the dim ones and it reads as a rendering fault
 * rather than a highlight.
 */
test("@smoke hero grid lights under the pointer and follows it", async ({
  page,
}) => {
  const response = await page.goto("/en");

  // The dim grid must come from the server, before any JS runs.
  const html = (await response?.text()) ?? "";
  expect(
    html,
    "the base hero grid must be server-rendered — it is the LCP band",
  ).toContain("--color-navy-900");

  const glow = page.locator(".hero-grid-glow");
  await expect(glow).toBeAttached();
  await expect(glow).toHaveCSS("opacity", "0");

  const hero = page.locator("#hero");
  const box = (await hero.boundingBox())!;

  await page.mouse.move(box.x + 300, box.y + 200);
  await page.waitForTimeout(500);
  const first = await glow.evaluate((el) => ({
    x: el.style.getPropertyValue("--glow-x"),
    opacity: getComputedStyle(el).opacity,
    bg: getComputedStyle(el).backgroundSize,
  }));

  expect(first.opacity, "must light up on hover").toBe("1");
  expect(first.x, "must record the pointer position").not.toBe("");
  expect(first.bg, "lit grid must share the base grid's 80px cell").toContain(
    "80px",
  );

  await page.mouse.move(box.x + 900, box.y + 350);
  await page.waitForTimeout(500);
  const second = await glow.evaluate((el) =>
    el.style.getPropertyValue("--glow-x"),
  );
  expect(second, "must follow the pointer, not stay where it started").not.toBe(
    first.x,
  );
});

/*
 * The case that shipped broken.
 *
 * Turning the light on used to live in a `pointerenter` handler, and
 * pointerenter does NOT fire for an element that appears under a STATIONARY
 * cursor. The hero fills the viewport, so arriving with the cursor already over
 * it is the normal case — click a link, land, move your hand. `--glow-x`
 * tracked correctly the whole time while `--glow-strength` stayed unset, so the
 * effect was silently dead until you left the hero and came back.
 *
 * The original test moved in from (0,0), outside the hero — the one path where
 * pointerenter does fire — which is exactly why it passed.
 */
test("@smoke hero glow lights even if the cursor was already there on load", async ({
  page,
}) => {
  // Park the cursor where the hero will render, BEFORE navigating.
  await page.mouse.move(640, 300);
  await page.goto("/en");
  // Wait for hydration, or the nudge below lands before the listener is
  // attached and the test measures the hydration race rather than the bug.
  await page.waitForLoadState("networkidle");

  // A small movement, still inside the hero — never crossing its boundary.
  await page.mouse.move(660, 310);
  await page.waitForTimeout(600);

  const glow = page.locator(".hero-grid-glow");
  await expect(
    glow,
    "the glow must light without the pointer having to cross into the hero",
  ).toHaveCSS("opacity", "1");
});

/*
 * A light that chases a finger it cannot track sits frozen wherever the last
 * tap landed, so the effect is skipped entirely on touch and under reduced
 * motion. Without these, both guards could be deleted and every other test
 * would still pass.
 */
test.describe("hero glow opt-outs", () => {
  test.use({ hasTouch: true, isMobile: true });

  /*
   * This test dispatches a synthetic `pointermove` rather than tapping.
   *
   * The first version tapped the screen and asserted the glow stayed dark — and
   * it passed with the opt-out DELETED, because a tap never produces a
   * pointermove in the first place. It could not distinguish a working guard
   * from no guard at all. Self-testing caught it; the reduced-motion sibling
   * failed correctly while this one sat green.
   *
   * A synthetic mouse pointermove is the discriminator: with the media gate in
   * place no listener is attached and nothing happens, and without it the glow
   * lights on a device that can never move a cursor.
   */
  test("@smoke stays dark on touch devices", async ({ page }) => {
    await page.goto("/en");
    await page.waitForLoadState("networkidle");

    expect(
      await page.evaluate(
        () => matchMedia("(hover: hover) and (pointer: fine)").matches,
      ),
      "this context must NOT report hover, or the test proves nothing",
    ).toBe(false);

    await page.evaluate(() => {
      document.querySelector("#hero")!.dispatchEvent(
        new PointerEvent("pointermove", {
          pointerType: "mouse",
          clientX: 200,
          clientY: 300,
          bubbles: true,
        }),
      );
    });
    await page.waitForTimeout(500);

    await expect(
      page.locator(".hero-grid-glow"),
      "no hover means the handler must never have been attached",
    ).toHaveCSS("opacity", "0");
  });
});

/*
 * `page.emulateMedia()`, NOT `test.use({ reducedMotion })`.
 *
 * test.use is silently ignored in this setup — the page reports
 * `matchMedia("(prefers-reduced-motion: reduce)").matches === false` — so a
 * test written that way passes for the wrong reason: nothing is emulated, the
 * glow behaves normally, and only an assertion inverted by luck would fail.
 * Verified both: test.use gives false, emulateMedia gives true.
 */
test("@smoke hero glow stays dark when reduced motion is requested", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await page.evaluate(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
    "the emulation itself must be in effect, or this test proves nothing",
  ).toBe(true);

  await page.goto("/en");
  await page.waitForLoadState("networkidle");

  const hero = page.locator("#hero");
  const box = (await hero.boundingBox())!;
  await page.mouse.move(box.x + 400, box.y + 250);
  await page.waitForTimeout(500);

  await expect(page.locator(".hero-grid-glow")).toHaveCSS("opacity", "0");
});
