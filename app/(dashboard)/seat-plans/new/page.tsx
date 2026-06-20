import { SeatPlanForm } from "@/components/seat-plan-form";
import { PageHeader } from "@/components/page-header";

export default function NewSeatPlanPage() {
  return (
    <div className="w-full md:px-6 px-4 py-6">
      <PageHeader
        title="Generate Seat Plan"
        description="Fill in exam details, add student groups, then generate."
      />
      <SeatPlanForm />
    </div>
  );
}
