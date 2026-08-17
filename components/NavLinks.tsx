"use client";

import { usePathname } from "next/navigation";

export function NavLinks() {
  const pathname = usePathname();
  return <nav><a href="/" aria-current={pathname === "/" ? "page" : undefined}>Assessment</a><a href="/admin" aria-current={pathname.startsWith("/admin") ? "page" : undefined}>Admin</a></nav>;
}
