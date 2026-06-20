import type { SeatGroup, SeatCell, Pattern, RoomAllocation } from "./types";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

interface Queue {
  label: string;
  groupId: string;
  rolls: string[];
}

function padRolls(start: string, end: string, count: number): string[] {
  const s = parseInt(start, 10);
  const e = parseInt(end, 10);
  if (isNaN(s) || isNaN(e)) return [];
  const rolls: string[] = [];
  for (let r = s; r <= e && rolls.length < count; r++) rolls.push(String(r));
  while (rolls.length < count) rolls.push(String(e));
  return rolls.slice(0, count);
}

function getRolls(group: SeatGroup): string[] {
  if (group.rollMode === "list" && group.rollList?.length > 0) {
    return [...group.rollList].slice(0, group.count);
  }
  return padRolls(group.rollStart, group.rollEnd, group.count);
}

function makeLabel(group: SeatGroup): string {
  return `${group.semester}${group.departmentCode}${group.shift}`;
}

function buildQueues(groups: SeatGroup[]): Queue[] {
  return groups
    .filter((g) => g.count > 0)
    .map((g) => ({ label: makeLabel(g), groupId: g.id, rolls: getRolls(g) }));
}

// ---------------------------------------------------------------------------
// Pattern fill functions — all consume from shared mutable queues
// ---------------------------------------------------------------------------

/**
 * Pattern C – Column-wise interleaved (Polytechnic board format).
 * Assigns columns to groups proportionally based on remaining students,
 * then interleaves column order so no two adjacent columns share a group.
 */
function fillPatternC(rows: number, cols: number, queues: Queue[]): (SeatCell | null)[][] {
  const grid: (SeatCell | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));

  const active = queues.filter((q) => q.rolls.length > 0);
  if (active.length === 0) return grid;

  const totalRemaining = active.reduce((s, q) => s + q.rolls.length, 0);

  // Proportional columns per group
  const colsPerGroup = active.map((q) =>
    Math.max(1, Math.ceil((q.rolls.length / totalRemaining) * cols))
  );

  // Scale to exactly `cols`
  let totalCols = colsPerGroup.reduce((a, b) => a + b, 0);
  while (totalCols > cols) {
    const maxIdx = colsPerGroup.indexOf(Math.max(...colsPerGroup));
    colsPerGroup[maxIdx]--;
    totalCols--;
  }
  while (totalCols < cols) {
    const maxIdx = active.reduce(
      (best, q, i) => (q.rolls.length > active[best].rolls.length ? i : best),
      0
    );
    colsPerGroup[maxIdx]++;
    totalCols++;
  }

  // Build interleaved column assignment (no two adjacent columns same group)
  const counts = [...colsPerGroup];
  const interleaved: number[] = [];
  while (interleaved.length < cols) {
    let placed = false;
    for (let i = 0; i < counts.length; i++) {
      if (counts[i] > 0 && interleaved[interleaved.length - 1] !== i) {
        interleaved.push(i);
        counts[i]--;
        placed = true;
        break;
      }
    }
    if (!placed) {
      for (let i = 0; i < counts.length; i++) {
        if (counts[i] > 0) { interleaved.push(i); counts[i]--; break; }
      }
    }
  }

  // Fill each column top-to-bottom
  for (let col = 0; col < cols; col++) {
    const q = active[interleaved[col]];
    for (let row = 0; row < rows && q.rolls.length > 0; row++) {
      grid[row][col] = { label: q.label, roll: q.rolls.shift()!, groupId: q.groupId };
    }
  }

  return grid;
}

/**
 * Pattern A – Columns alternate through groups in round-robin.
 */
function fillPatternA(rows: number, cols: number, queues: Queue[]): (SeatCell | null)[][] {
  const grid: (SeatCell | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));

  let qi = 0;

  for (let col = 0; col < cols; col++) {
    // Find next non-empty queue for this column
    let q: Queue | null = null;
    for (let i = 0; i < queues.length; i++) {
      const candidate = queues[(qi + i) % queues.length];
      if (candidate.rolls.length > 0) {
        q = candidate;
        qi = (qi + i + 1) % queues.length;
        break;
      }
    }
    if (!q) break;

    for (let row = 0; row < rows; row++) {
      if (q.rolls.length > 0) {
        grid[row][col] = { label: q.label, roll: q.rolls.shift()!, groupId: q.groupId };
      } else {
        // Column's group exhausted — fill remainder from any available queue
        const backup = queues.find((x) => x.rolls.length > 0);
        if (backup) {
          grid[row][col] = { label: backup.label, roll: backup.rolls.shift()!, groupId: backup.groupId };
        }
      }
    }
  }

  return grid;
}

/**
 * Pattern B – Zigzag: cycle through groups cell-by-cell across rows.
 */
function fillPatternB(rows: number, cols: number, queues: Queue[]): (SeatCell | null)[][] {
  const grid: (SeatCell | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));

  let qi = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let found = false;
      for (let i = 0; i < queues.length; i++) {
        const q = queues[(qi + i) % queues.length];
        if (q.rolls.length > 0) {
          grid[row][col] = { label: q.label, roll: q.rolls.shift()!, groupId: q.groupId };
          qi = (qi + i + 1) % queues.length;
          found = true;
          break;
        }
      }
      if (!found) return grid;
    }
  }

  return grid;
}

/**
 * Pattern D – Shuffle all remaining students in this room, fill randomly.
 */
function fillPatternD(rows: number, cols: number, queues: Queue[]): (SeatCell | null)[][] {
  const grid: (SeatCell | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));

  const capacity = rows * cols;
  const pool: SeatCell[] = [];

  for (const q of queues) {
    while (q.rolls.length > 0 && pool.length < capacity) {
      pool.push({ label: q.label, roll: q.rolls.shift()!, groupId: q.groupId });
    }
    if (pool.length >= capacity) break;
  }

  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  let idx = 0;
  for (let row = 0; row < rows && idx < pool.length; row++) {
    for (let col = 0; col < cols && idx < pool.length; col++) {
      grid[row][col] = pool[idx++];
    }
  }

  return grid;
}

function fillRoom(
  rows: number,
  cols: number,
  queues: Queue[],
  pattern: Pattern
): (SeatCell | null)[][] {
  switch (pattern) {
    case "A": return fillPatternA(rows, cols, queues);
    case "B": return fillPatternB(rows, cols, queues);
    case "C": return fillPatternC(rows, cols, queues);
    case "D": return fillPatternD(rows, cols, queues);
    default:  return fillPatternC(rows, cols, queues);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface MultiRoomInput {
  rooms: { id: string; number: string; rows: number; columns: number }[];
  groups: SeatGroup[];
  pattern: Pattern;
}

/**
 * Generates seat allocations for multiple rooms.
 * Students are distributed sequentially: Room 1 fills first, then Room 2, etc.
 * Queues are shared so no student appears in two rooms.
 */
export function generateMultiRoomSeatPlan(input: MultiRoomInput): RoomAllocation[] {
  const queues = buildQueues(input.groups);

  return input.rooms.map((room) => ({
    roomId: room.id,
    roomNumber: room.number,
    rows: room.rows,
    columns: room.columns,
    grid: fillRoom(room.rows, room.columns, queues, input.pattern),
  }));
}

/** Legacy single-room wrapper — kept for any existing callers. */
export interface EngineInput {
  rows: number;
  columns: number;
  groups: SeatGroup[];
  pattern: Pattern;
}

export function generateSeatPlan(input: EngineInput): (SeatCell | null)[][] {
  const [allocation] = generateMultiRoomSeatPlan({
    rooms: [{ id: "single", number: "", rows: input.rows, columns: input.columns }],
    groups: input.groups,
    pattern: input.pattern,
  });
  return allocation?.grid ?? Array.from({ length: input.rows }, () => Array(input.columns).fill(null));
}
