"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import type { SeatPlan } from "@/lib/types";
import { SeatPlanForm, seatPlanFormDefaultValues } from "@/components/seat-plan-form";

export default function EditSeatPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { seatPlans } = useStore();
  const router = useRouter();
  const [plan, setPlan] = useState<SeatPlan | null>(null);

  useEffect(() => {
    const found = seatPlans.find((p) => p.id === id);
    if (found) setPlan(found);
    else if (seatPlans.length > 0) router.replace("/seat-plans");
  }, [seatPlans, id, router]);

  if (!plan) {
    return <div className="w-full md:px-6 px-4 py-20 text-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="w-full md:px-6 px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold">Edit Seat Plan</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update details or student groups, then regenerate.
        </p>
      </div>
      <SeatPlanForm existingPlanId={id} defaultValues={seatPlanFormDefaultValues(plan)} />
    </div>
  );
}
