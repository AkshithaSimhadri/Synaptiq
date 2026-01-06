
import { StudyPlannerForm } from "./study-planner-form";

export default function StudyPlannerPage() {
  return (
    <div className="bg-page-planner -m-4 md:-m-6 lg:-m-8 p-4 md:p-6 lg:p-8 flex-1">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold md:text-4xl font-headline text-gradient">Smart Study Planner</h1>
          <p className="max-w-2xl text-muted-foreground">
              Enter your subjects, deadlines, and available time to generate a complete, prioritized study plan. 
              This tool will create a daily schedule, weekly breakdown, and completion tracker to keep you on track.
          </p>
        </div>
        <StudyPlannerForm />
      </div>
    </div>
  );
}
