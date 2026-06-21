"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  DoorOpen,
  Users,
  ClipboardList,
  LogOut,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { supabase } from "@/lib/supabase";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/departments", label: "Departments", icon: BookOpen },
  { href: "/rooms", label: "Rooms", icon: DoorOpen },
  { href: "/students", label: "Students", icon: Users },
  { href: "/seat-plans", label: "Seat Plans", icon: ClipboardList },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    router.push("/login");
  }

  return (
    <aside className="w-60 shrink-0 flex flex-col border-r border-sidebar-border bg-sidebar h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-sidebar-border">
        <Image
          src="/gailogo.png"
          alt="GAI Logo"
          width={60}
          height={60}
          className="shrink-0 rounded object-contain"
        />
        <div className="min-w-0">
          <p className="text-base font-semibold leading-tight truncate">GAI</p>
          <p className="text-base text-muted-foreground leading-tight truncate">
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
      <div className="px-3 py-3 border-t border-sidebar-border space-y-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="flex flex-1 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-destructive bg-destructive/10 hover:bg-destructive hover:text-white transition-colors"
          >
            <LogOut className="size-4 shrink-0" />
            Sign out
          </button>
          <ThemeToggle />
        </div>
        <p className="text-[11px] text-muted-foreground leading-tight px-1">
          Developed by{" "}
          <a
            href="https://tarekdeveloper.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline underline-offset-2"
          >
            Md. Tarek
          </a>
        </p>
      </div>
    </aside>
  );
}
