"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Printer, ArrowLeft, Trash2, Pencil } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useStore } from "@/lib/store";
import type { SeatPlan, SeatCell, RoomAllocation } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

/** Normalize old single-room plans and new multi-room plans to the same shape. */
function getRoomAllocations(plan: SeatPlan): RoomAllocation[] {
  if (plan.roomAllocations?.length > 0) return plan.roomAllocations;
  if (plan.grid) {
    return [{
      roomId: plan.roomId ?? "",
      roomNumber: plan.roomNumber ?? "",
      rows: plan.rows ?? 0,
      columns: plan.columns ?? 0,
      grid: plan.grid,
    }];
  }
  return [];
}

function groupSummary(plan: SeatPlan): string {
  return plan.seatGroups
    .map((g) => {
      const shiftLabel = g.shift === "1" ? "1ST" : g.shift === "2" ? "2ND" : "3RD";
      const rollRange =
        g.rollMode === "list"
          ? `${g.rollList?.[0] ?? ""}…${g.rollList?.[g.rollList.length - 1] ?? ""}=${g.count}`
          : `${g.rollStart}-${g.rollEnd}=${g.count}`;
      return `${g.semester}${g.departmentCode}(${shiftLabel}): ${rollRange}`;
    })
    .join("  |  ");
}

export default function SeatPlanViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { seatPlans, deleteSeatPlan } = useStore();
  const [plan, setPlan] = useState<SeatPlan | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const found = seatPlans.find((p) => p.id === id);
    if (found) setPlan(found);
  }, [seatPlans, id]);

  if (!plan) {
    return (
      <div className="w-full md:px-6 px-4 py-20 text-center text-muted-foreground">
        Loading seat plan…
      </div>
    );
  }

  const roomAllocations = getRoomAllocations(plan);
  const totalStudents = plan.seatGroups.reduce((s, g) => s + g.count, 0);
  const roomLabel = roomAllocations.map((r) => r.roomNumber).join(", ");

  const examDateDisplay = plan.examDate
    ? new Date(plan.examDate).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
    : "";
  const generatedDate = new Date(plan.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric",
  });
  const summary = groupSummary(plan);

  return (
    <>
      {/* ── Screen controls ─────────────────────────────────────────────── */}
      <div className="print:hidden sticky top-0 z-10 bg-background border-b border-border">
        <div className="w-full md:px-6 px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Button variant="ghost" size="icon-sm" onClick={() => router.push("/seat-plans")}>
              <ArrowLeft />
            </Button>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight truncate">{plan.title}</p>
              <p className="text-xs text-muted-foreground hidden sm:block">
                {roomAllocations.length > 1
                  ? `${roomAllocations.length} rooms`
                  : `Room ${roomLabel}`}{" "}
                · {totalStudents} students
              </p>
            </div>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hidden sm:flex"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 />
              <span className="hidden sm:inline">Delete</span>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/seat-plans/${id}/edit`}>
                <Pencil />
                <span className="hidden sm:inline">Edit</span>
              </Link>
            </Button>
            <Button size="sm" onClick={() => window.print()}>
              <Printer />
              <span className="hidden sm:inline">Print / PDF</span>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive sm:hidden"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Printable content ────────────────────────────────────────────── */}
      <div className="w-full md:px-6 px-4 py-4 space-y-10 print:space-y-0 print:w-full print:p-0">
        {roomAllocations.map((allocation, idx) => (
          <div
            key={allocation.roomId || idx}
            className={idx < roomAllocations.length - 1 ? "pb-8 border-b border-dashed border-border" : ""}
            {...(idx > 0 ? { "data-room-break": "true" } : {})}
            style={idx > 0 ? { breakBefore: "page", pageBreakBefore: "always" } : undefined}
          >
            {/* Room separator label (screen only, for multiple rooms) */}
            {roomAllocations.length > 1 && (
              <div className="print:hidden flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                  Room {allocation.roomNumber}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
            )}

            {/* Polytechnic board header */}
            <div className="text-center mb-3 print:mb-2">
              {plan.instituteName && (
                <p className="text-sm font-semibold">{plan.instituteName}</p>
              )}
              <h1 className="text-base font-bold">{plan.title}</h1>
              {examDateDisplay && (
                <p className="text-sm">Date: {examDateDisplay}</p>
              )}
              <div className="flex justify-between items-start mt-1 px-1">
                <p className="text-xs text-left">
                  {roomAllocations.length > 1
                    ? `Page ${idx + 1} / ${roomAllocations.length}`
                    : " "}
                </p>
                <p className="text-[11px] text-center leading-snug max-w-[60%]">{summary}</p>
                <p className="text-xs font-semibold text-right">Room: {allocation.roomNumber}</p>
              </div>
            </div>

            {/* Grid table */}
            <div className="overflow-x-auto print:overflow-visible">
              <RoomGrid allocation={allocation} />
            </div>

            {/* Per-room footer (visible on both screen and print) */}
            <div className="mt-3 flex justify-between items-end text-[10px] text-gray-500 print:mt-2">
              <p>Generated: {generatedDate}</p>
              <p className="font-semibold text-gray-700">Graphic Arts Institute Seat Planner</p>
              <p>Page {idx + 1}</p>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Seat Plan?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => { deleteSeatPlan(id); toast.success("Seat plan deleted"); router.push("/seat-plans"); }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function RoomGrid({ allocation }: { allocation: RoomAllocation }) {
  const colLabels = Array.from({ length: allocation.columns }, (_, i) => `Col-${i + 1}`);
  const minWidth = allocation.columns * 80 + 36;

  return (
    <table
      className="w-full border-collapse text-sm"
      style={{ tableLayout: "fixed", minWidth: `${minWidth}px` }}
    >
      <thead>
        <tr>
          <th
            className="border border-border print:border-black p-1 text-center font-semibold bg-muted/60 print:bg-gray-100"
            style={{ width: "28px" }}
          />
          {colLabels.map((col) => (
            <th key={col} className="border border-border print:border-black p-1 text-center font-semibold bg-muted/60 print:bg-gray-100">
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {allocation.grid.map((row, rowIdx) => (
          <tr key={rowIdx}>
            <td className="border border-border print:border-black p-1 text-center text-xs font-medium align-middle bg-muted/60 print:bg-gray-100 h-12.5">
              {rowIdx + 1}
            </td>
            {row.map((cell, colIdx) => (
              <SeatCellTd key={colIdx} cell={cell} />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SeatCellTd({ cell }: { cell: SeatCell | null }) {
  if (!cell) return <td className="border border-border print:border-black p-1 h-12.5" />;
  return (
    <td className="border border-border print:border-black p-1.5 text-center align-middle h-12.5">
      <div className="font-semibold leading-snug text-sm">{cell.label}</div>
      <div className="font-mono leading-snug text-sm">{cell.roll}</div>
    </td>
  );
}
