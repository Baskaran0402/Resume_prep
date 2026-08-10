"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BrainCircuit } from "lucide-react";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/prepare", label: "Study Plan" },
  { href: "/interview", label: "Mock Interview" },
  { href: "/profile", label: "Profile" },
];

export function Navbar() {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");
  const isHome = pathname === "/";

  if (isAuthPage || isHome) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-foreground">
          <BrainCircuit className="w-5 h-5 text-blue-500" />
          InterviewIQ
        </Link>

        <nav className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                pathname === link.href
                  ? "bg-muted text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="ml-2 pl-2 border-l border-border">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
