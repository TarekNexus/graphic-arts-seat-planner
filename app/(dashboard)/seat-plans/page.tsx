"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Eye, Trash2, ClipboardList } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

const PATTERN_LABELS: Record<string, string> = {
  A: "Alternate", B: "Zigzag", C: "Column-wise", D: "Random",
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Seat Plans</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All generated seat plans. Click to preview and print.
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/seat-plans/new"><Plus />Generate New</Link>
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-24 border border-dashed rounded-lg space-y-3">
          <ClipboardList className="size-10 mx-auto text-muted-foreground/50" />
          <p className="text-muted-foreground">No seat plans yet.</p>
          <Button asChild variant="outline">
            <Link href="/seat-plans/new">Generate your first seat plan</Link>
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden sm:table-cell">Rooms</TableHead>
                <TableHead>Groups</TableHead>
                <TableHead className="hidden md:table-cell">Pattern</TableHead>
                <TableHead className="hidden sm:table-cell">Students</TableHead>
                <TableHead className="hidden lg:table-cell">Created</TableHead>
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((plan) => {
                const total = plan.seatGroups.reduce((s, g) => s + g.count, 0);
                const roomLabel = planRoomLabel(plan);
                const roomCount = plan.roomAllocations?.length ?? 1;
                return (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">
                      <div>{plan.title}</div>
                      <div className="text-xs text-muted-foreground sm:hidden">
                        {roomCount > 1 ? `${roomCount} rooms` : `Room ${roomLabel}`} · {total} students
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span>{roomLabel}</span>
                        {roomCount > 1 && (
                          <Badge variant="secondary" className="text-xs">{roomCount} rooms</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
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
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline">{PATTERN_LABELS[plan.pattern] ?? plan.pattern}</Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{total}</TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                      {new Date(plan.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" asChild>
                          <Link href={`/seat-plans/${plan.id}`}><Eye /></Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeleteId(plan.id)}
                          className="text-destructive hover:text-destructive"
                        >
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
