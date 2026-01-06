
import { RecommendCareerForm } from "./recommend-career-form";

export default function CareerPage() {
  return (
    <div className="bg-page-career -m-4 md:-m-6 lg:-m-8 p-4 md:p-6 lg:p-8 flex-1">
      <div className="space-y-8">
        <h1 className="text-3xl font-bold font-headline text-gradient">AI Skill & Career Matcher</h1>
        <RecommendCareerForm />
      </div>
    </div>
  );
}
