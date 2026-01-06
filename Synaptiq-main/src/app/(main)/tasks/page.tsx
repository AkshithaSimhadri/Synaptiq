
import { ClientOnly } from "@/components/client-only";
import { TaskManager } from "./task-manager";

export default function TasksPage() {
  return (
    <div className="bg-page-tasks -m-4 md:-m-6 lg:-m-8 p-4 md:p-6 lg:p-8 flex-1">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold md:text-4xl font-headline text-gradient">To-Do List</h1>
          <p className="max-w-2xl text-muted-foreground">
            Manage your study tasks by subject. Completing tasks here will update your dashboard progress.
          </p>
        </div>
        <ClientOnly>
          <TaskManager />
        </ClientOnly>
      </div>
    </div>
  );
}
