
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { StudyProgressChart } from "@/components/dashboard/study-progress-chart";
import { WeeklyActivityChart } from "@/components/dashboard/weekly-activity-chart";

export default function AnalyticsPage() {
  return (
    <div className="bg-page-analytics -m-4 md:-m-6 lg:-m-8 p-4 md:p-6 lg:p-8 flex-1">
      <div className="space-y-8">
        <h1 className="text-3xl font-bold font-headline text-gradient">Student Performance Analytics</h1>
        
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Overall Score" value="82" unit="%" change="+3%" />
          <StatCard title="Completed Topics" value="58" change="+8" />
          <StatCard title="Most Studied" value="Science" />
          <StatCard title="Least Studied" value="English" />
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          <Card className="col-span-1 lg:col-span-3">
            <CardHeader>
              <CardTitle className="font-headline">Weekly Study Hours</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <WeeklyActivityChart />
            </CardContent>
          </Card>
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-headline">Progress by Subject</CardTitle>
            </CardHeader>
            <CardContent>
              <StudyProgressChart />
            </CardContent>
          </Card>
        </div>

         <Card>
          <CardHeader>
            <CardTitle className="font-headline">Performance Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your performance in "Science" has improved significantly over the last two weeks. However, "English" has seen a slight decline in study time and progress. Consider allocating a bit more time to review English topics.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
