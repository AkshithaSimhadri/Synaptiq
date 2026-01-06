
import { HabitTracker } from "./habit-tracker";
import { ClientOnly } from "@/components/client-only";

export default function HabitsPage() {
  return (
    <div className="bg-page-habits -m-4 md:-m-6 lg:-m-8 p-4 md:p-6 lg:p-8 flex-1">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold md:text-4xl font-headline text-gradient">Habit Builder</h1>
          <p className="max-w-2xl text-muted-foreground">
            Build healthy routines and track your progress. Consistency is key to a better you.
          </p>
        </div>
        <ClientOnly>
          <HabitTracker />
        </ClientOnly>
      </div>
    </div>
  );
}
