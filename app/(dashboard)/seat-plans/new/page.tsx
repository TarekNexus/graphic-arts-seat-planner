import { SeatPlanForm } from "@/components/seat-plan-form";

export default function NewSeatPlanPage() {
  return (
    <div className="w-full md:px-6 px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold">Generate Seat Plan</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fill in exam details, add student groups, then generate.
        </p>
      </div>
      <SeatPlanForm />
    </div>
  );
}
