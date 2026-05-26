"use client";

import { initBackNavigationDetection } from "@/lib/navigation/back-navigation";

/** Patch history as early as the client bundle loads (before user navigation). */
if (typeof window !== "undefined") {
  initBackNavigationDetection();
}
