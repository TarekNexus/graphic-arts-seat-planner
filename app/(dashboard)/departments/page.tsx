"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useStore } from "@/lib/store";
import type { Department } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FormState { name: string; shortCode: string }
const EMPTY_FORM: FormState = { name: "", shortCode: "" };

export default function DepartmentsPage() {
  const { departments, addDepartment, updateDepartment, deleteDepartment } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function openAdd() { setEditing(null); setForm(EMPTY_FORM); setOpen(true); }
  function openEdit(dept: Department) { setEditing(dept); setForm({ name: dept.name, shortCode: dept.shortCode }); setOpen(true); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = form.name.trim();
    const shortCode = form.shortCode.trim().toUpperCase();
    if (!name || !shortCode) return;
    if (editing) { updateDepartment(editing.id, { name, shortCode }); toast.success("Department updated"); }
    else { addDepartment({ name, shortCode }); toast.success("Department added"); }
    setOpen(false);
  }

  return (
    <div className="w-full md:px-6 px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Departments</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage departments and their short codes.
          </p>
        </div>
        <Button onClick={openAdd} className="w-full sm:w-auto">
          <Plus />
          Add Department
        </Button>
      </div>

      {departments.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border border-dashed rounded-lg">
          No departments yet. Add your first department.
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Short Code</TableHead>
                <TableHead className="hidden sm:table-cell">Added</TableHead>
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{dept.shortCode}</Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                    {new Date(dept.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(dept)}>
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost" size="icon-sm"
                        onClick={() => setDeleteId(dept.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 />
                      </Button>
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
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Department" : "Add Department"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="dept-name">Department Name</Label>
              <Input id="dept-name" placeholder="e.g. Computer Technology"
                value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dept-code">Short Code</Label>
              <Input id="dept-code" placeholder="e.g. CST"
                value={form.shortCode} maxLength={6}
                onChange={(e) => setForm(f => ({ ...f, shortCode: e.target.value.toUpperCase() }))} required />
              <p className="text-xs text-muted-foreground">Used in seat labels like <code>1CST1</code></p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">{editing ? "Save Changes" : "Add"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Department?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deleteId) { deleteDepartment(deleteId); toast.success("Department deleted"); } setDeleteId(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
