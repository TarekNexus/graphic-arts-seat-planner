"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, List, AlignJustify, CheckSquare } from "lucide-react";
import toast from "react-hot-toast";
import { useStore } from "@/lib/store";
import { generateMultiRoomSeatPlan } from "@/lib/seat-engine";
import type { SeatGroup, Pattern, Shift, RollMode, SeatPlan } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const SHIFTS: { value: Shift; label: string }[] = [
  { value: "1", label: "1st Shift (Morning)" },
  { value: "2", label: "2nd Shift (Day)" },
  { value: "3", label: "3rd Shift (Evening)" },
];
const PATTERNS: { value: Pattern; label: string; desc: string }[] = [
  { value: "C", label: "Pattern C – Column-wise", desc: "Each group fills full columns, interleaved to separate departments (Polytechnic board format)" },
  { value: "A", label: "Pattern A – Alternate", desc: "Groups alternate by column in round-robin order" },
  { value: "B", label: "Pattern B – Zigzag", desc: "Cycle through groups cell-by-cell across rows" },
  { value: "D", label: "Pattern D – Random Mix", desc: "Randomly distribute all students" },
];

const ORDINAL: Record<number, string> = { 1: "st", 2: "nd", 3: "rd" };

export interface GroupDraft {
  id: string;
  departmentId: string;
  semester: string;
  shift: Shift;
  rollMode: RollMode;
  rollStart: string;
  rollEnd: string;
  rollListRaw: string;
  count: string;
}

function newGroupDraft(): GroupDraft {
  return {
    id: crypto.randomUUID(),
    departmentId: "",
    semester: "1",
    shift: "1",
    rollMode: "range",
    rollStart: "",
    rollEnd: "",
    rollListRaw: "",
    count: "",
  };
}

function parseRollList(raw: string): string[] {
  return raw
    .split(/[\n,،\s]+/)
    .map((r) => r.trim())
    .filter((r) => r.length > 0);
}

export function seatPlanFormDefaultValues(plan: SeatPlan): {
  title: string;
  instituteName: string;
  examDate: string;
  roomIds: string[];
  pattern: Pattern;
  groups: GroupDraft[];
} {
  // Derive roomIds from new format or fall back to legacy single room
  const roomIds =
    plan.roomAllocations?.length > 0
      ? plan.roomAllocations.map((r) => r.roomId)
      : plan.roomId
      ? [plan.roomId]
      : [];

  return {
    title: plan.title,
    instituteName: plan.instituteName,
    examDate: plan.examDate,
    roomIds,
    pattern: plan.pattern,
    groups: plan.seatGroups.map((g) => ({
      id: g.id,
      departmentId: g.departmentId,
      semester: String(g.semester),
      shift: g.shift,
      rollMode: g.rollMode ?? "range",
      rollStart: g.rollStart,
      rollEnd: g.rollEnd,
      rollListRaw: (g.rollList ?? []).join("\n"),
      count: String(g.count),
    })),
  };
}

interface Props {
  existingPlanId?: string;
  defaultValues?: ReturnType<typeof seatPlanFormDefaultValues>;
}

export function SeatPlanForm({ existingPlanId, defaultValues }: Props) {
  const router = useRouter();
  const { departments, rooms, saveSeatPlan } = useStore();

  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [instituteName, setInstituteName] = useState(defaultValues?.instituteName ?? "");
  const [examDate, setExamDate] = useState(defaultValues?.examDate ?? "");
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>(defaultValues?.roomIds ?? []);
  const [pattern, setPattern] = useState<Pattern>(defaultValues?.pattern ?? "C");
  const [groups, setGroups] = useState<GroupDraft[]>(
    defaultValues?.groups ?? [newGroupDraft()]
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedRooms = rooms.filter((r) => selectedRoomIds.includes(r.id));
  const totalCapacity = selectedRooms.reduce((s, r) => s + r.capacity, 0);

  function toggleRoom(id: string) {
    setSelectedRoomIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function updateGroup(id: string, patch: Partial<GroupDraft>) {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const next = { ...g, ...patch };
        // Auto-calculate count from roll range
        if ("rollStart" in patch || "rollEnd" in patch) {
          const s = parseInt(next.rollStart, 10);
          const e = parseInt(next.rollEnd, 10);
          if (!isNaN(s) && !isNaN(e) && e >= s) {
            next.count = String(e - s + 1);
          }
        }
        return next;
      })
    );
  }

  function removeGroup(id: string) {
    setGroups((prev) => prev.filter((g) => g.id !== id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (selectedRoomIds.length === 0) { setError("Please select at least one room."); return; }
    if (groups.length === 0) { setError("Add at least one student group."); return; }

    const validGroups: SeatGroup[] = [];
    for (const g of groups) {
      const dept = departments.find((d) => d.id === g.departmentId);
      if (!dept) { setError("Select a department for each group."); return; }

      if (g.rollMode === "range") {
        const count = parseInt(g.count, 10);
        if (!count || count <= 0) { setError("Enter a valid student count for each group."); return; }
        if (!g.rollStart.trim() || !g.rollEnd.trim()) {
          setError("Enter roll start and end for each group."); return;
        }
        validGroups.push({
          id: g.id,
          departmentId: dept.id,
          departmentCode: dept.shortCode,
          semester: parseInt(g.semester, 10),
          shift: g.shift,
          rollMode: "range",
          rollStart: g.rollStart.trim(),
          rollEnd: g.rollEnd.trim(),
          rollList: [],
          count,
        });
      } else {
        const rollList = parseRollList(g.rollListRaw);
        if (rollList.length === 0) {
          setError("Enter at least one roll number in the custom list."); return;
        }
        validGroups.push({
          id: g.id,
          departmentId: dept.id,
          departmentCode: dept.shortCode,
          semester: parseInt(g.semester, 10),
          shift: g.shift,
          rollMode: "list",
          rollStart: rollList[0],
          rollEnd: rollList[rollList.length - 1],
          rollList,
          count: rollList.length,
        });
      }
    }

    const totalStudents = validGroups.reduce((s, g) => s + g.count, 0);
    if (totalStudents > totalCapacity) {
      setError(
        `Total students (${totalStudents}) exceeds total room capacity (${totalCapacity}).`
      );
      return;
    }

    const roomAllocations = generateMultiRoomSeatPlan({
      rooms: selectedRooms.map((r) => ({
        id: r.id,
        number: r.number,
        rows: r.rows,
        columns: r.columns,
      })),
      groups: validGroups,
      pattern,
    });

    const plan: SeatPlan = {
      id: existingPlanId ?? crypto.randomUUID(),
      title: title.trim() || "Seat Plan",
      instituteName: instituteName.trim(),
      examDate,
      pattern,
      seatGroups: validGroups,
      roomAllocations,
      createdAt: new Date().toISOString(),
    };

    try {
      setSubmitting(true);
      await saveSeatPlan(plan);
      toast.success(existingPlanId ? "Seat plan updated!" : "Seat plan generated!");
      router.push(`/seat-plans/${plan.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save";
      setError("Failed to save. Check your database connection and try again.");
      toast.error(msg);
      setSubmitting(false);
    }
  }

  const totalStudents = groups.reduce((s, g) => {
    if (g.rollMode === "list") return s + parseRollList(g.rollListRaw).length;
    return s + (parseInt(g.count) || 0);
  }, 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Exam Info */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold">Exam Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="inst-name">Institute Name</Label>
            <Input
              id="inst-name"
              placeholder="e.g. Dhaka Polytechnic Institute"
              value={instituteName}
              onChange={(e) => setInstituteName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="plan-title">Exam Title</Label>
            <Input
              id="plan-title"
              placeholder="e.g. 1st & 2nd Term Mid-term Exam"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="exam-date">Exam Date</Label>
            <Input
              id="exam-date"
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* Room selection — multi-select checkboxes */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Rooms</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select one or more rooms. Students fill rooms in order.
            </p>
          </div>
          {selectedRooms.length > 0 && (
            <span className="text-xs text-muted-foreground">
              Total capacity: <strong>{totalCapacity}</strong> seats
            </span>
          )}
        </div>

        {rooms.length === 0 ? (
          <p className="text-sm text-destructive">
            No rooms found.{" "}
            <a href="/rooms" className="underline">Add rooms first.</a>
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {rooms.map((room) => {
              const selected = selectedRoomIds.includes(room.id);
              const orderIdx = selectedRoomIds.indexOf(room.id);
              return (
                <label
                  key={room.id}
                  className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer transition-colors select-none ${
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleRoom(room.id)}
                      className="sr-only"
                    />
                    <div
                      className={`size-5 rounded border-2 flex items-center justify-center transition-colors ${
                        selected ? "border-primary bg-primary" : "border-muted-foreground/40 bg-background"
                      }`}
                    >
                      {selected && (
                        <CheckSquare className="size-3.5 text-primary-foreground" strokeWidth={3} />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">Room {room.number}</p>
                      {selected && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0">
                          #{orderIdx + 1}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {room.rows} rows × {room.columns} cols = {room.capacity} seats
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </section>

      <Separator />

      {/* Pattern */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold">Seat Pattern</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PATTERNS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPattern(p.value)}
              className={`text-left border rounded-lg p-3 transition-colors ${
                pattern === p.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <p className="text-sm font-medium">{p.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
            </button>
          ))}
        </div>
      </section>

      <Separator />

      {/* Student Groups */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Student Groups</h2>
            {selectedRooms.length > 0 && totalStudents > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {totalStudents} / {totalCapacity} seats
                {totalStudents > totalCapacity && (
                  <span className="text-destructive ml-1">(exceeds capacity)</span>
                )}
              </p>
            )}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => setGroups((p) => [...p, newGroupDraft()])}>
            <Plus />
            Add Group
          </Button>
        </div>

        <div className="space-y-4">
          {groups.map((g, idx) => {
            const dept = departments.find((d) => d.id === g.departmentId);
            const label = dept ? `${g.semester}${dept.shortCode}${g.shift}` : "";
            const listCount = g.rollMode === "list" ? parseRollList(g.rollListRaw).length : null;

            return (
              <div key={g.id} className="border rounded-lg p-4 space-y-3">
                {/* Group header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Group {idx + 1}
                    </span>
                    {label && (
                      <Badge variant="secondary" className="font-mono">
                        {label}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Roll mode toggle */}
                    <div className="flex border rounded-md overflow-hidden text-xs">
                      <button
                        type="button"
                        onClick={() => updateGroup(g.id, { rollMode: "range" })}
                        className={`flex items-center gap-1 px-2.5 py-1.5 transition-colors ${
                          g.rollMode === "range"
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                        title="Sequential range"
                      >
                        <AlignJustify className="size-3" />
                        Range
                      </button>
                      <button
                        type="button"
                        onClick={() => updateGroup(g.id, { rollMode: "list" })}
                        className={`flex items-center gap-1 px-2.5 py-1.5 transition-colors border-l ${
                          g.rollMode === "list"
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                        title="Custom roll list"
                      >
                        <List className="size-3" />
                        Custom
                      </button>
                    </div>
                    {groups.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeGroup(g.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Dept / Semester / Shift */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label>Department</Label>
                    <Select
                      value={g.departmentId}
                      onValueChange={(v) => updateGroup(g.id, { departmentId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select dept" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.shortCode} – {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {departments.length === 0 && (
                      <p className="text-xs text-destructive">
                        <a href="/departments" className="underline">Add departments first</a>
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label>Semester</Label>
                    <Select
                      value={g.semester}
                      onValueChange={(v) => updateGroup(g.id, { semester: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SEMESTERS.map((s) => (
                          <SelectItem key={s} value={String(s)}>
                            {s}{ORDINAL[s] ?? "th"} Semester
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Shift</Label>
                    <Select
                      value={g.shift}
                      onValueChange={(v) => updateGroup(g.id, { shift: v as Shift })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SHIFTS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Roll input — Range or Custom List */}
                {g.rollMode === "range" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label>Roll Start</Label>
                      <Input
                        placeholder="e.g. 103703"
                        value={g.rollStart}
                        onChange={(e) => updateGroup(g.id, { rollStart: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Roll End</Label>
                      <Input
                        placeholder="e.g. 802091"
                        value={g.rollEnd}
                        onChange={(e) => updateGroup(g.id, { rollEnd: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label>Student Count</Label>
                        {g.count && (
                          <span className="text-xs text-muted-foreground">auto</span>
                        )}
                      </div>
                      <Input
                        type="number"
                        min={1}
                        placeholder="auto from range"
                        value={g.count}
                        onChange={(e) => updateGroup(g.id, { count: e.target.value })}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label>Roll Numbers</Label>
                      {listCount !== null && listCount > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {listCount} rolls detected
                        </span>
                      )}
                    </div>
                    <Textarea
                      rows={5}
                      placeholder={`Paste roll numbers — one per line or comma-separated:\n103703\n103721\n111672\n...`}
                      value={g.rollListRaw}
                      onChange={(e) => updateGroup(g.id, { rollListRaw: e.target.value })}
                      className="font-mono text-xs"
                    />
                    <p className="text-xs text-muted-foreground">
                      Count is automatically taken from the list. You can use newlines, commas, or spaces.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {error && (
        <p className="text-sm text-destructive border border-destructive/30 bg-destructive/5 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3 justify-end pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/seat-plans")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : existingPlanId ? "Save & Regenerate" : "Generate Seat Plan"}
        </Button>
      </div>
    </form>
  );
}
