"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  BookOpen,
  DoorOpen,
  Users,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/departments", label: "Departments", icon: BookOpen },
  { href: "/rooms", label: "Rooms", icon: DoorOpen },
  { href: "/students", label: "Students", icon: Users },
  { href: "/seat-plans", label: "Seat Plans", icon: ClipboardList },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile top bar — hidden on md+ and print */}
      <div className="md:hidden print:hidden sticky top-0 z-30 flex items-center gap-3 h-14 px-4 border-b border-border bg-background">
        <button
          onClick={() => setOpen(true)}
          className="p-1.5 rounded-md hover:bg-muted transition-colors"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Image src="/gailogo.png" alt="GAI Logo" width={28} height={28} className="shrink-0 rounded object-contain" />
          <span className="font-semibold text-sm truncate">GAI Seat Planner</span>
        </div>
        <ThemeToggle />
      </div>

      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden print:hidden",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-200 ease-in-out md:hidden print:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="GAI Logo" width={36} height={36} className="shrink-0 rounded object-contain" />
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight">GAI</p>
              <p className="text-xs text-muted-foreground leading-tight">Seat Planner</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
            aria-label="Close menu"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Drawer nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-3 border-t border-sidebar-border">
          <p className="text-xs text-muted-foreground">
            Graphic Arts Institute Seat Planner
          </p>
        </div>
      </div>
    </>
  );
}
