"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
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

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 flex flex-col border-r border-sidebar-border bg-sidebar h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-sidebar-border">
        <Image
          src="/logo.png"
          alt="GAI Logo"
          width={40}
          height={40}
          className="shrink-0 rounded object-contain"
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-tight truncate">GAI</p>
          <p className="text-xs text-muted-foreground leading-tight truncate">
            Seat Planner
          </p>
        </div>
      </div>

      {/* Nav */}
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
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
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

      {/* Footer */}
      <div className="px-4 py-3 border-t border-sidebar-border flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Graphic Arts Institute<br />Seat Planner
        </p>
        <ThemeToggle />
      </div>
    </aside>
  );
}
