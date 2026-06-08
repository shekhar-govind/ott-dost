"use client";

import { rememberPersonName } from "@/lib/api/person";
import Link from "next/link";
import type { ReactNode } from "react";

interface PersonBrowseLinkProps {
  href: string;
  personId: number;
  personName: string;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}

export function PersonBrowseLink({
  href,
  personId,
  personName,
  children,
  className,
  "aria-label": ariaLabel,
}: PersonBrowseLinkProps) {
  return (
    <Link
      href={href}
      scroll
      className={className}
      aria-label={ariaLabel}
      onClick={() => {
        rememberPersonName(personId, personName);
      }}
    >
      {children}
    </Link>
  );
}
