"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export function NavLinks() {
  const pathname = usePathname();
  return <nav><Link href="/" aria-current={pathname === "/" ? "page" : undefined}>Assessment</Link></nav>;
}
