import { LegalPage } from "@/components/layout/LegalPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | OTT Dost",
  description: "How OTT Dost handles data when you use the site.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        OTT Dost helps you find where movies and TV shows are available to stream,
        rent, or buy in India. This policy describes what information is involved
        when you use the site.
      </p>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-zinc-800">What we collect</h2>
        <p>
          OTT Dost does not require an account. We do not ask for your name, email,
          or payment details to use the core service.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong className="font-medium text-zinc-700">Usage and technical data:</strong>{" "}
            Our hosting provider (for example Vercel) may log requests such as IP
            address, browser type, pages visited, and timestamps for security and
            operations.
          </li>
          <li>
            <strong className="font-medium text-zinc-700">Browser storage:</strong>{" "}
            The site may store your browse filter choices in{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs text-zinc-700">
              localStorage
            </code>{" "}
            so returning visits feel smoother. This stays on your device and is
            not sent to our servers as a profile.
          </li>
          <li>
            <strong className="font-medium text-zinc-700">Search and browse queries:</strong>{" "}
            When you search or change filters, your browser requests our API routes,
            which forward queries to The Movie Database (TMDB) to return results.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-zinc-800">Third-party services</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong className="font-medium text-zinc-700">TMDB</strong> supplies
            metadata, images, and India watch-provider information. Their use is
            governed by{" "}
            <a
              href="https://www.themoviedb.org/terms-of-use"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-700 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900"
            >
              TMDB&apos;s terms
            </a>
            .
          </li>
          <li>
            <strong className="font-medium text-zinc-700">Streaming platforms</strong>{" "}
            shown on title pages (Netflix, Prime Video, JioHotstar, and others) are
            third parties. We do not control their apps, billing, or catalogs.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-zinc-800">Analytics</h2>
        <p>
          We use{" "}
          <a
            href="https://vercel.com/docs/analytics"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-700 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900"
          >
            Vercel Web Analytics
          </a>{" "}
          to understand general usage (for example which pages are visited, where
          traffic comes from, and device or browser types). This helps us improve
          the site. Vercel Analytics does not use cookies for basic page-view
          tracking and does not build a personal profile of you across other
          websites.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-zinc-800">Your choices</h2>
        <p>
          You can clear site data in your browser settings. You can stop using the
          site at any time.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-zinc-800">Changes</h2>
        <p>
          We may update this policy as the product changes. The &quot;Last
          updated&quot; date at the top will change when we do.
        </p>
      </section>
    </LegalPage>
  );
}
