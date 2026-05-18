import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const outDir = new URL("../public/design-mockups/", import.meta.url);

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
const base = "http://localhost:3000/design/filter-mockups";

await page.goto(base, { waitUntil: "networkidle" });
await page.setViewportSize({ width: 1280, height: 900 });
await page.screenshot({
  path: new URL("overview-desktop.png", outDir).pathname,
  fullPage: true,
});

const headings = [
  ["reference-desktop.png", "Live home page (reference)"],
  ["option-1-desktop.png", "Filter bar + bottom sheet"],
  ["option-2-desktop.png", "Horizontal filter lanes"],
  ["option-3-desktop.png", "Smart filter / command style"],
  ["option-4-desktop.png", "Collapsible refine card"],
  ["option-5-desktop.png", "Sidebar filter rail"],
];

for (const [file, name] of headings) {
  const heading = page.getByRole("heading", { name, exact: true });
  await heading.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  const section = page.locator("section").filter({ has: heading });
  await section.screenshot({ path: new URL(file, outDir).pathname });
}

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(base, { waitUntil: "networkidle" });

const mobileHeadings = [
  ["reference-mobile.png", "Live home page (reference)"],
  ["option-1-mobile.png", "Filter bar + bottom sheet"],
  ["option-2-mobile.png", "Horizontal filter lanes"],
  ["option-3-mobile.png", "Smart filter / command style"],
  ["option-4-mobile.png", "Collapsible refine card"],
  ["option-5-mobile.png", "Sidebar filter rail"],
];

for (const [file, name] of mobileHeadings) {
  const heading = page.getByRole("heading", { name, exact: true });
  await heading.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  const section = page.locator("section").filter({ has: heading });
  await section.screenshot({ path: new URL(file, outDir).pathname });
}

await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.screenshot({
  path: new URL("home-live-mobile.png", outDir).pathname,
});

await browser.close();
console.log("Screenshots saved to public/design-mockups/");
