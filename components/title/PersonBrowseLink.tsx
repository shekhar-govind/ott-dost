"use client";

import { StableClientLink } from "@/components/shared/StableClientLink";
import { rememberPersonName } from "@/lib/api/person";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

interface PersonBrowseLinkProps extends ComponentProps<typeof Link> {
  personId: number;
  personName: string;
  children: ReactNode;
}

export function PersonBrowseLink({
  href,
  personId,
  personName,
  children,
  onClick,
  ...props
}: PersonBrowseLinkProps) {
  return (
    <StableClientLink
      href={href}
      scroll
      onClick={(event) => {
        rememberPersonName(personId, personName);
        onClick?.(event);
      }}
      {...props}
    >
      {children}
    </StableClientLink>
  );
}
