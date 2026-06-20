"use client";

import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function StudentsPage() {
  return (
    <div className="w-full md:px-6 px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold">Students</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Students are defined per seat plan as roll number ranges or custom lists.
        </p>
      </div>

      <div className="border rounded-lg p-5 bg-muted/30 space-y-4">
        <div className="flex gap-3">
          <Info className="size-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm">
            <p className="font-medium">How students work in GAI Seat Planner</p>
            <p className="text-muted-foreground">
              Instead of importing individual records, define student groups on
              the seat plan using:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-1">
              <li><strong>Department</strong> – e.g. Computer Technology (CST)</li>
              <li><strong>Semester</strong> – 1st through 8th</li>
              <li><strong>Shift</strong> – 1st (Morning) or 2nd (Day)</li>
              <li>
                <strong>Roll Range</strong> – start → end → count
                (sequential generation)
              </li>
              <li>
                <strong>Custom List</strong> – paste actual non-sequential roll
                numbers, one per line
              </li>
            </ul>
          </div>
        </div>

        <Separator />

        <div className="text-sm space-y-2">
          <p className="font-medium">Seat label format</p>
          <div className="font-mono text-xs bg-background border rounded p-3 space-y-1">
            <p><span className="text-primary font-semibold">1</span>CST<span className="text-primary font-semibold">1</span> → Semester 1 · Computer Technology · Shift 1</p>
            <p><span className="text-primary font-semibold">2</span>PT<span className="text-primary font-semibold">2</span> → Semester 2 · Printing Technology · Shift 2</p>
            <p><span className="text-primary font-semibold">5</span>GD<span className="text-primary font-semibold">1</span> → Semester 5 · Graphic Design · Shift 1</p>
          </div>
          <p className="text-muted-foreground">
            Go to <strong>Seat Plans → Generate</strong> to start assigning seats.
          </p>
        </div>
      </div>
    </div>
  );
}
