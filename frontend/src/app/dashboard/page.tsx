import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StreakBar from "@/components/dashboard/StreakBar";
import LifeWheel from "@/components/dashboard/LifeWheel";
import NextActions from "@/components/dashboard/NextActions";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <StreakBar />
        <LifeWheel />
        <NextActions />
      </div>
    </DashboardLayout>
  );
}
