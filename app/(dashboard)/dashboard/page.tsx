"use client";

import Link from "next/link";
import { BookOpen, DoorOpen, ClipboardList, Plus, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { departments, rooms, seatPlans } = useStore();

  const recentPlans = [...seatPlans]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const stats = [
    {
      label: "Departments",
      value: departments.length,
      icon: BookOpen,
      href: "/departments",
      color: "bg-[#00aeef]/10 text-[#00aeef]",
    },
    {
      label: "Rooms",
      value: rooms.length,
      icon: DoorOpen,
      href: "/rooms",
      color: "bg-emerald-500/10 text-emerald-600",
    },
    {
      label: "Seat Plans",
      value: seatPlans.length,
      icon: ClipboardList,
      href: "/seat-plans",
      color: "bg-violet-500/10 text-violet-600",
    },
  ];

  return (
    <div className="w-full md:px-6  px-4 mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Graphic Arts Institute Seat Planner overview
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/seat-plans/new">
            <Plus />
            Generate Seat Plan
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <Link
            key={label}
            href={href}
            className="border border-primary/50 rounded-lg p-5 hover:border-primary transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-3xl font-bold mt-1">{value}</p>
              </div>
              <div className={`rounded-full p-3 ${color}`}>
                <Icon className="size-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 group-hover:text-foreground transition-colors flex items-center gap-1">
              Manage {label.toLowerCase()} <ArrowRight className="size-3" />
            </p>
          </Link>
        ))}
      </div>

      {/* Get started */}
      {(departments.length === 0 || rooms.length === 0) && (
        <div className="border border-dashed rounded-lg p-6 space-y-4">
          <h2 className="text-base font-semibold">Get started</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            {departments.length === 0 && (
              <div className="flex items-center gap-2">
                <span className="size-5 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <span>
                  <Link href="/departments" className="underline font-medium text-foreground">
                    Add departments
                  </Link>{" "}
                  (CST, PT, GD, etc.)
                </span>
              </div>
            )}
            {rooms.length === 0 && (
              <div className="flex items-center gap-2">
                <span className="size-5 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                  {departments.length === 0 ? "2" : "1"}
                </span>
                <span>
                  <Link href="/rooms" className="underline font-medium text-foreground">
                    Add rooms
                  </Link>{" "}
                  with rows and columns
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="size-5 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                {(departments.length === 0 ? 1 : 0) + (rooms.length === 0 ? 1 : 0) + 1}
              </span>
              <span>
                <Link href="/seat-plans/new" className="underline font-medium text-foreground">
                  Generate a seat plan
                </Link>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Recent plans */}
      {recentPlans.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent Seat Plans</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/seat-plans">View all</Link>
            </Button>
          </div>
          <div className="border rounded-lg divide-y">
            {recentPlans.map((plan) => {
              const total = plan.seatGroups.reduce((s, g) => s + g.count, 0);
              return (
                <Link
                  key={plan.id}
                  href={`/seat-plans/${plan.id}`}
                  className="flex items-center justify-between p-4 hover:bg-muted/40 transition-colors gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{plan.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {plan.roomAllocations?.length
                        ? plan.roomAllocations.map(r => r.roomNumber).join(", ")
                        : plan.roomNumber ?? "—"}{" "}
                      · {total} students ·{" "}
                      {new Date(plan.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">
                    {plan.seatGroups.slice(0, 3).map((g) => (
                      <Badge key={g.id} variant="secondary" className="font-mono text-xs">
                        {g.semester}{g.departmentCode}{g.shift}
                      </Badge>
                    ))}
                    {plan.seatGroups.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{plan.seatGroups.length - 3}
                      </Badge>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
