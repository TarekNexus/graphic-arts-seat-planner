"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Eye, Trash2, ClipboardList } from "lucide-react";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

const PATTERN_LABELS: Record<string, string> = {
  A: "Alternate", B: "Zigzag", C: "Column-wise", D: "Random", E: "Board Format",
};

function planRoomLabel(plan: ReturnType<typeof useStore>["seatPlans"][number]): string {
  if (plan.roomAllocations?.length) {
    return plan.roomAllocations.map((r) => r.roomNumber).join(", ");
  }
  return plan.roomNumber ?? "-";
}

export default function SeatPlansPage() {
  const { seatPlans, deleteSeatPlan } = useStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const sorted = [...seatPlans].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="w-full md:px-6 px-4 py-6">
      <PageHeader
        title="Seat Plans"
        description="All generated seat plans. Click to preview and print."
        action={
          <Button asChild className="w-full sm:w-auto">
            <Link href="/seat-plans/new"><Plus />Generate New</Link>
          </Button>
        }
      />

      {sorted.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-primary/20 rounded-lg space-y-3">
          <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <ClipboardList className="size-7 text-primary" />
          </div>
          <p className="text-muted-foreground">No seat plans yet.</p>
          <Button asChild variant="outline" className="border-primary/40 hover:border-primary hover:bg-primary/5 hover:text-primary">
            <Link href="/seat-plans/new">Generate your first seat plan</Link>
          </Button>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="hidden sm:table-cell font-semibold">Rooms</TableHead>
                <TableHead className="font-semibold">Groups</TableHead>
                <TableHead className="hidden md:table-cell font-semibold">Pattern</TableHead>
                <TableHead className="hidden md:table-cell font-semibold">Shift</TableHead>
                <TableHead className="hidden lg:table-cell font-semibold">Time</TableHead>
                <TableHead className="hidden sm:table-cell font-semibold">Students</TableHead>
                <TableHead className="hidden lg:table-cell font-semibold">Created</TableHead>
                <TableHead className="w-20 text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((plan) => {
                const total = plan.seatGroups.reduce((s, g) => s + g.count, 0);
                const roomLabel = planRoomLabel(plan);
                const roomCount = plan.roomAllocations?.length ?? 1;
                return (
                  <TableRow key={plan.id} className="hover:bg-primary/5 transition-colors group">
                    <TableCell className="font-medium">
                      <Link href={`/seat-plans/${plan.id}`} className="hover:text-primary transition-colors">
                        {plan.title}
                      </Link>
                      <div className="text-xs text-muted-foreground sm:hidden mt-0.5">
                        {roomCount > 1 ? `${roomCount} rooms` : `Room ${roomLabel}`} · {total} students
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-sm font-medium">{roomLabel}</span>
                        {roomCount > 1 && (
                          <Badge className="text-xs bg-primary/10 text-primary border border-primary/20">{roomCount} rooms</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
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
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                        {PATTERN_LABELS[plan.pattern] ?? plan.pattern}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {plan.examShift ? (
                        <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                          {plan.examShift === "1" ? "1st Shift" : "2nd Shift"}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                      {plan.examTime
                        ? new Date(`1970-01-01T${plan.examTime}`).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true })
                        : "—"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell font-medium">{total}</TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                      {new Date(plan.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-sm"
                          className="hover:text-primary hover:bg-primary/10" asChild>
                          <Link href={`/seat-plans/${plan.id}`}><Eye /></Link>
                        </Button>
                        <Button variant="ghost" size="icon-sm"
                          className="hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteId(plan.id)}>
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Seat Plan?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => { if (deleteId) deleteSeatPlan(deleteId); setDeleteId(null); }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
