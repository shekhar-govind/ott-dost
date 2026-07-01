import { LegalPage } from "@/components/layout/LegalPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer | OTT Dost",
  description: "Important limitations about OTT Dost availability information.",
};

export default function DisclaimerPage() {
  return (
    <LegalPage title="Disclaimer">
      <p>
        OTT Dost is an independent guide to help you discover where titles may be
        available to stream. Please read the following before relying on any listing.
      </p>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-zinc-800">Not affiliated</h2>
        <p>
          OTT Dost is not owned by, endorsed by, or affiliated with Netflix, Amazon
          Prime Video, JioHotstar, Sony LIV, Zee5, Apple TV, or any other streaming
          service shown on this site. Platform names and logos are used for
          identification only.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-zinc-800">Accuracy of availability</h2>
        <p>
          Watch, rent, and buy information comes from third-party data (including
          TMDB) and can be delayed, incomplete, or wrong. Catalogs change by region,
          plan, and date. Always confirm on the official app or website of the
          platform before subscribing, renting, or purchasing.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-zinc-800">No professional advice</h2>
        <p>
          Content on this site is for general information only. It is not legal,
          financial, or consumer advice.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-zinc-800">External links</h2>
        <p>
          If we link to external sites, we are not responsible for their content,
          policies, or availability.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-zinc-800">Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, OTT Dost is provided &quot;as
          is&quot; without warranties. We are not liable for decisions you make based
          on listings here, including missed shows, wrong platform, or subscription
          choices.
        </p>
      </section>
    </LegalPage>
  );
}
