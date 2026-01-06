
import { ClientOnly } from "@/components/client-only";
import { SleepCoachDashboard } from "./sleep-coach-dashboard";

export default function SleepCoachPage() {
  return (
    <div className="bg-page-sleep -m-4 md:-m-6 lg:-m-8 p-4 md:p-6 lg:p-8 flex-1">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold md:text-4xl font-headline text-gradient">Smart Sleep Coach</h1>
          <p className="max-w-2xl text-muted-foreground">
            Log your sleep, analyze your patterns, and get AI-powered tips to improve your rest and boost your performance.
          </p>
        </div>
        <ClientOnly>
          <SleepCoachDashboard />
        </ClientOnly>
      </div>
    </div>
  );
}
