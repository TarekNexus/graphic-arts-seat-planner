"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/page-header";
import type { Room } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface FormState { number: string; rows: string; columns: string }
const EMPTY_FORM: FormState = { number: "", rows: "18", columns: "8" };

export default function RoomsPage() {
  const { rooms, addRoom, updateRoom, deleteRoom } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function openAdd() { setEditing(null); setForm(EMPTY_FORM); setOpen(true); }
  function openEdit(r: Room) {
    setEditing(r);
    setForm({ number: r.number, rows: String(r.rows), columns: String(r.columns) });
    setOpen(true);
  }
  function field(k: keyof FormState, v: string) { setForm(f => ({ ...f, [k]: v })); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const number = form.number.trim();
    const rows = parseInt(form.rows, 10);
    const columns = parseInt(form.columns, 10);
    if (!number || !rows || !columns) return;
    const capacity = rows * columns;
    if (editing) { updateRoom(editing.id, { number, rows, columns, capacity }); toast.success("Room updated"); }
    else { addRoom({ number, rows, columns, capacity }); toast.success("Room added"); }
    setOpen(false);
  }

  const previewCapacity = (parseInt(form.rows) || 0) * (parseInt(form.columns) || 0);

  return (
    <div className="w-full md:px-6 px-4 py-6">
      <PageHeader
        title="Rooms"
        description="Manage exam rooms and seating capacity."
        action={
          <Button onClick={openAdd} className="w-full sm:w-auto">
            <Plus />Add Room
          </Button>
        }
      />

      {rooms.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border border-dashed border-primary/20 rounded-lg">
          No rooms yet. Add your first room.
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="font-semibold">Room</TableHead>
                <TableHead className="hidden sm:table-cell font-semibold">Rows</TableHead>
                <TableHead className="hidden sm:table-cell font-semibold">Columns</TableHead>
                <TableHead className="font-semibold">Capacity</TableHead>
                <TableHead className="w-20 text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room) => (
                <TableRow key={room.id} className="hover:bg-primary/5 transition-colors">
                  <TableCell className="font-semibold text-primary">{room.number}</TableCell>
                  <TableCell className="hidden sm:table-cell">{room.rows}</TableCell>
                  <TableCell className="hidden sm:table-cell">{room.columns}</TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 font-mono">
                      {room.capacity} seats
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm"
                        className="hover:text-primary hover:bg-primary/10"
                        onClick={() => openEdit(room)}><Pencil /></Button>
                      <Button variant="ghost" size="icon-sm"
                        className="hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteId(room.id)}><Trash2 /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Room" : "Add Room"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="room-number">Room Number / Name</Label>
              <Input id="room-number" placeholder="e.g. 301 or Common Room"
                value={form.number} onChange={e => field("number", e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="room-rows">Rows</Label>
                <Input id="room-rows" type="number" min={1} max={50}
                  value={form.rows} onChange={e => field("rows", e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="room-cols">Columns</Label>
                <Input id="room-cols" type="number" min={1} max={20}
                  value={form.columns} onChange={e => field("columns", e.target.value)} required />
              </div>
            </div>
            {previewCapacity > 0 && (
              <p className="text-sm text-muted-foreground">
                Capacity: <strong>{previewCapacity} seats</strong>
              </p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">{editing ? "Save Changes" : "Add"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Room?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deleteId) { deleteRoom(deleteId); toast.success("Room deleted"); } setDeleteId(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
