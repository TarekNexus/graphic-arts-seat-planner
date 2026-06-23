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

export type Shift = "1" | "2" ; 
export type RollMode = "range" | "list"; 

export interface SeatGroup {
  id: string;
  departmentId: string;
  departmentCode: string;
  semester: number;
  shift: Shift;
  groupCode?: string;
  rollMode: RollMode;
  rollStart: string;
  rollEnd: string;
  rollList: string[];
  count: number;
}

export type Pattern = "A" | "B" | "C" | "D" | "E";

export interface SeatCell {
  label: string;    
  roll: string;     
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
  examTime?: string;
  examShift?: "1" | "2";
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
