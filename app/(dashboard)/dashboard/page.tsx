"use client";

import Link from "next/link";
import { BookOpen, DoorOpen, ClipboardList, Plus, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
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
      gradient: "from-primary/10",
      border: "border-primary/30 hover:border-primary/70",
      iconClass: "bg-primary/10 text-primary",
      manage: "Manage departments",
    },
    {
      label: "Rooms",
      value: rooms.length,
      icon: DoorOpen,
      href: "/rooms",
      gradient: "from-emerald-500/10",
      border: "border-emerald-500/30 hover:border-emerald-500/70",
      iconClass: "bg-emerald-500/10 text-emerald-600",
      manage: "Manage rooms",
    },
    {
      label: "Seat Plans",
      value: seatPlans.length,
      icon: ClipboardList,
      href: "/seat-plans",
      gradient: "from-violet-500/10",
      border: "border-violet-500/30 hover:border-violet-500/70",
      iconClass: "bg-violet-500/10 text-violet-600",
      manage: "Manage seat plans",
    },
  ];

  return (
    <div className="w-full md:px-6  px-4 mx-auto py-6 space-y-8">
      <PageHeader
        title="Dashboard"
        description="Graphic Arts Institute Seat Planner overview"
        action={
          <Button asChild className="w-full sm:w-auto">
            <Link href="/seat-plans/new"><Plus />Generate Seat Plan</Link>
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, href, gradient, border, iconClass, manage }) => (
          <Link
            key={label}
            href={href}
            className={`relative overflow-hidden border ${border} rounded-xl p-5 bg-linear-to-br ${gradient} to-transparent transition-all group`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-3xl font-bold mt-1">{value}</p>
              </div>
              <div className={`rounded-full p-3 ${iconClass}`}>
                <Icon className="size-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 group-hover:text-foreground transition-colors flex items-center gap-1">
              {manage} <ArrowRight className="size-3" />
            </p>
          </Link>
        ))}
      </div>

      {/* Get started */}
      {(departments.length === 0 || rooms.length === 0) && (
        <div className="border border-dashed border-primary/20 rounded-xl p-6 bg-primary/5 space-y-4">
          <h2 className="text-base font-semibold text-primary">Get started</h2>
          <div className="space-y-3 text-sm">
            {departments.length === 0 && (
              <div className="flex items-center gap-3">
                <span className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <span className="text-muted-foreground">
                  <Link href="/departments" className="font-semibold text-foreground hover:text-primary transition-colors">
                    Add departments
                  </Link>{" "}
                  (CST, PT, GD, etc.)
                </span>
              </div>
            )}
            {rooms.length === 0 && (
              <div className="flex items-center gap-3">
                <span className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                  {departments.length === 0 ? "2" : "1"}
                </span>
                <span className="text-muted-foreground">
                  <Link href="/rooms" className="font-semibold text-foreground hover:text-primary transition-colors">
                    Add rooms
                  </Link>{" "}
                  with rows and columns
                </span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <span className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                {(departments.length === 0 ? 1 : 0) + (rooms.length === 0 ? 1 : 0) + 1}
              </span>
              <span className="text-muted-foreground">
                <Link href="/seat-plans/new" className="font-semibold text-foreground hover:text-primary transition-colors">
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
            <Button variant="ghost" size="sm" className="hover:text-primary hover:bg-primary/10" asChild>
              <Link href="/seat-plans">View all</Link>
            </Button>
          </div>
          <div className="border border-border rounded-xl divide-y overflow-hidden">
            {recentPlans.map((plan) => {
              const total = plan.seatGroups.reduce((s, g) => s + g.count, 0);
              return (
                <Link
                  key={plan.id}
                  href={`/seat-plans/${plan.id}`}
                  className="flex items-center justify-between p-4 hover:bg-primary/5 transition-colors gap-3 group"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{plan.title}</p>
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
                      <Badge key={g.id} className="font-mono text-xs bg-primary/10 text-primary border border-primary/20">
                        {g.semester}{g.departmentCode}{g.shift}
                      </Badge>
                    ))}
                    {plan.seatGroups.length > 3 && (
                      <Badge variant="outline" className="text-xs border-border">
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
