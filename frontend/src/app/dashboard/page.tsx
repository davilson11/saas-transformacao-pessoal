import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StreakBar from "@/components/dashboard/StreakBar";
import LifeWheel from "@/components/dashboard/LifeWheel";
import NextActions from "@/components/dashboard/NextActions";
import PhaseProgress from "@/components/dashboard/PhaseProgress";
import VitalityScore from "@/components/dashboard/VitalityScore";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <StreakBar />
        <LifeWheel />
        <NextActions />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <PhaseProgress />
          <VitalityScore />
        </div>
      </div>
    </DashboardLayout>
  );
}
