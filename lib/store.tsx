"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "./supabase";
import type { Department, Room, SeatPlan, Pattern } from "./types";

// ---------------------------------------------------------------------------
// DB row shapes (snake_case from Supabase)
// ---------------------------------------------------------------------------

interface DbDepartment {
  id: string;
  name: string;
  short_code: string;
  created_at: string;
}

interface DbRoom {
  id: string;
  number: string;
  rows: number;
  columns: number;
  capacity: number;
  created_at: string;
}

interface DbSeatPlan {
  id: string;
  title: string;
  institute_name: string;
  exam_date: string;
  exam_time: string | null;
  exam_shift: string | null;
  pattern: string;
  seat_groups: unknown;
  room_allocations: unknown;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function dbToDept(row: DbDepartment): Department {
  return { id: row.id, name: row.name, shortCode: row.short_code, createdAt: row.created_at };
}

function dbToRoom(row: DbRoom): Room {
  return {
    id: row.id, number: row.number, rows: row.rows,
    columns: row.columns, capacity: row.capacity, createdAt: row.created_at,
  };
}

function dbToSeatPlan(row: DbSeatPlan): SeatPlan {
  return {
    id: row.id,
    title: row.title,
    instituteName: row.institute_name,
    examDate: row.exam_date,
    examTime: row.exam_time ?? undefined,
    examShift: (row.exam_shift as SeatPlan["examShift"]) ?? undefined,
    pattern: row.pattern as Pattern,
    seatGroups: (row.seat_groups ?? []) as SeatPlan["seatGroups"],
    roomAllocations: (row.room_allocations ?? []) as SeatPlan["roomAllocations"],
    createdAt: row.created_at,
  };
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface StoreValue {
  departments: Department[];
  rooms: Room[];
  seatPlans: SeatPlan[];
  loading: boolean;
  dbError: string | null;
  addDepartment: (dept: Omit<Department, "id" | "createdAt">) => Promise<void>;
  updateDepartment: (id: string, dept: Partial<Omit<Department, "id" | "createdAt">>) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
  addRoom: (room: Omit<Room, "id" | "createdAt">) => Promise<void>;
  updateRoom: (id: string, room: Partial<Omit<Room, "id" | "createdAt">>) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
  saveSeatPlan: (plan: SeatPlan) => Promise<void>;
  deleteSeatPlan: (id: string) => Promise<void>;
}

const StoreContext = createContext<StoreValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [seatPlans, setSeatPlans] = useState<SeatPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Initial fetch
  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      setLoading(true);
      setDbError(null);
      try {
        const [deptsRes, roomsRes, plansRes] = await Promise.all([
          supabase.from("departments").select("*").order("created_at"),
          supabase.from("rooms").select("*").order("created_at"),
          supabase.from("seat_plans").select("*").order("created_at", { ascending: false }),
        ]);

        if (deptsRes.error) throw deptsRes.error;
        if (roomsRes.error) throw roomsRes.error;
        if (plansRes.error) throw plansRes.error;

        if (!cancelled) {
          setDepartments((deptsRes.data as DbDepartment[]).map(dbToDept));
          setRooms((roomsRes.data as DbRoom[]).map(dbToRoom));
          setSeatPlans((plansRes.data as DbSeatPlan[]).map(dbToSeatPlan));
        }
      } catch (err) {
        if (!cancelled) {
          setDbError("Could not connect to database. Check your Supabase credentials.");
          console.error("[store] fetch error:", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, []);

  // ── Departments ──────────────────────────────────────────────────────────

  const addDepartment = useCallback(async (dept: Omit<Department, "id" | "createdAt">) => {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const { error } = await supabase.from("departments").insert({
      id, name: dept.name, short_code: dept.shortCode, created_at: createdAt,
    });
    if (!error) {
      setDepartments((prev) => [...prev, { id, ...dept, createdAt }]);
    } else {
      console.error("[store] addDepartment:", error);
    }
  }, []);

  const updateDepartment = useCallback(
    async (id: string, dept: Partial<Omit<Department, "id" | "createdAt">>) => {
      const patch: Record<string, unknown> = {};
      if (dept.name !== undefined) patch.name = dept.name;
      if (dept.shortCode !== undefined) patch.short_code = dept.shortCode;

      const { error } = await supabase.from("departments").update(patch).eq("id", id);
      if (!error) {
        setDepartments((prev) => prev.map((d) => d.id === id ? { ...d, ...dept } : d));
      } else {
        console.error("[store] updateDepartment:", error);
      }
    },
    []
  );

  const deleteDepartment = useCallback(async (id: string) => {
    const { error } = await supabase.from("departments").delete().eq("id", id);
    if (!error) {
      setDepartments((prev) => prev.filter((d) => d.id !== id));
    } else {
      console.error("[store] deleteDepartment:", error);
    }
  }, []);

  // ── Rooms ────────────────────────────────────────────────────────────────

  const addRoom = useCallback(async (room: Omit<Room, "id" | "createdAt">) => {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const { error } = await supabase.from("rooms").insert({
      id, number: room.number, rows: room.rows,
      columns: room.columns, capacity: room.capacity, created_at: createdAt,
    });
    if (!error) {
      setRooms((prev) => [...prev, { id, ...room, createdAt }]);
    } else {
      console.error("[store] addRoom:", error);
    }
  }, []);

  const updateRoom = useCallback(
    async (id: string, room: Partial<Omit<Room, "id" | "createdAt">>) => {
      const { error } = await supabase.from("rooms").update(room).eq("id", id);
      if (!error) {
        setRooms((prev) => prev.map((r) => r.id === id ? { ...r, ...room } : r));
      } else {
        console.error("[store] updateRoom:", error);
      }
    },
    []
  );

  const deleteRoom = useCallback(async (id: string) => {
    const { error } = await supabase.from("rooms").delete().eq("id", id);
    if (!error) {
      setRooms((prev) => prev.filter((r) => r.id !== id));
    } else {
      console.error("[store] deleteRoom:", error);
    }
  }, []);

  // ── Seat Plans ───────────────────────────────────────────────────────────

  const saveSeatPlan = useCallback(async (plan: SeatPlan) => {
    const { error } = await supabase.from("seat_plans").upsert({
      id: plan.id,
      title: plan.title,
      institute_name: plan.instituteName,
      exam_date: plan.examDate,
      exam_time: plan.examTime ?? null,
      exam_shift: plan.examShift ?? null,
      pattern: plan.pattern,
      seat_groups: plan.seatGroups,
      room_allocations: plan.roomAllocations,
      created_at: plan.createdAt,
    });
    if (!error) {
      setSeatPlans((prev) => [plan, ...prev.filter((p) => p.id !== plan.id)]);
    } else {
      console.error("[store] saveSeatPlan:", error);
      throw error; // let the form know it failed
    }
  }, []);

  const deleteSeatPlan = useCallback(async (id: string) => {
    const { error } = await supabase.from("seat_plans").delete().eq("id", id);
    if (!error) {
      setSeatPlans((prev) => prev.filter((p) => p.id !== id));
    } else {
      console.error("[store] deleteSeatPlan:", error);
    }
  }, []);

  // ── Context value ────────────────────────────────────────────────────────

  const value: StoreValue = {
    departments, rooms, seatPlans, loading, dbError,
    addDepartment, updateDepartment, deleteDepartment,
    addRoom, updateRoom, deleteRoom,
    saveSeatPlan, deleteSeatPlan,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within <StoreProvider>");
  return ctx;
}
