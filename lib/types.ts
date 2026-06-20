export interface Department {
  id: string;
  name: string;
  shortCode: string;
  createdAt: string;
}

export interface Room {
  id: string;
  number: string;
  rows: number;
  columns: number;
  capacity: number;
  createdAt: string;
}

export type Shift = "1" | "2" | "3"; // 1=Morning/1ST, 2=Day/2ND, 3=Evening
export type RollMode = "range" | "list"; // range = sequential, list = custom/scattered

export interface SeatGroup {
  id: string;
  departmentId: string;
  departmentCode: string;
  semester: number;
  shift: Shift;
  rollMode: RollMode;
  rollStart: string;  // used when rollMode = "range"
  rollEnd: string;    // used when rollMode = "range"
  rollList: string[]; // used when rollMode = "list" — actual roll numbers
  count: number;
}

export type Pattern = "A" | "B" | "C" | "D";

export interface SeatCell {
  label: string;    // e.g. "1CST1"
  roll: string;     // e.g. "103703"
  groupId: string;
}

export interface RoomAllocation {
  roomId: string;
  roomNumber: string;
  rows: number;
  columns: number;
  grid: (SeatCell | null)[][];
}

export interface SeatPlan {
  id: string;
  title: string;
  instituteName: string;
  examDate: string;
  pattern: Pattern;
  seatGroups: SeatGroup[];
  /** Primary: one allocation per selected room */
  roomAllocations: RoomAllocation[];
  /** Legacy single-room fields — kept for backward compat with old localStorage data */
  roomId?: string;
  roomNumber?: string;
  rows?: number;
  columns?: number;
  grid?: (SeatCell | null)[][];
  createdAt: string;
}

export interface AppData {
  departments: Department[];
  rooms: Room[];
  seatPlans: SeatPlan[];
}
