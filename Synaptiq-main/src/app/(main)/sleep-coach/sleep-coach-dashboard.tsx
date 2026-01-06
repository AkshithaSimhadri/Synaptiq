
"use client";

import { useAppData, SleepLog } from "@/context/app-data-context";
import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SleepLogForm } from "./sleep-log-form";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight, Lightbulb } from "lucide-react";
import { WeeklySleepChart } from "./weekly-sleep-chart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { generateSleepTips } from "@/ai/flows/generate-sleep-tips";
import { Skeleton } from "@/components/ui/skeleton";
import { format, differenceInMinutes, parse } from "date-fns";

type AITips = {
  mainInsight: string;
  personalizedTips: string[];
  reminderSuggestion: string;
}

// Helper function to calculate sleep duration in hours
const calculateDuration = (bedtime: string, wakeTime: string, date: string): number => {
    const bedDateTime = parse(`${date} ${bedtime}`, 'yyyy-MM-dd HH:mm', new Date());
    let wakeDateTime = parse(`${date} ${wakeTime}`, 'yyyy-MM-dd HH:mm', new Date());

    // If wake time is on the next day
    if (wakeDateTime <= bedDateTime) {
        wakeDateTime.setDate(wakeDateTime.getDate() + 1);
    }
    
    const durationMinutes = differenceInMinutes(wakeDateTime, bedDateTime);
    return durationMinutes / 60;
};

export function SleepCoachDashboard() {
  const { sleepLogs, addSleepLog } = useAppData();
  const [aiTips, setAiTips] = useState<AITips | null>(null);
  const [isLoadingTips, setIsLoadingTips] = useState(false);
  
  const recentLogs = useMemo(() => sleepLogs.slice(0, 7), [sleepLogs]);

  const analytics = useMemo(() => {
    if (recentLogs.length < 2) {
      return {
        consistencyScore: 0,
        avgQuality: "N/A",
        avgDuration: 0,
      };
    }

    // Consistency (standard deviation of bedtime in minutes)
    const bedtimesInMinutes = recentLogs.map(log => {
        const [h, m] = log.bedtime.split(':').map(Number);
        return h * 60 + m;
    });
    const avgBedtime = bedtimesInMinutes.reduce((sum, time) => sum + time, 0) / bedtimesInMinutes.length;
    const bedtimeVariance = bedtimesInMinutes.reduce((sum, time) => sum + Math.pow(time - avgBedtime, 2), 0) / bedtimesInMinutes.length;
    const bedtimeStdDev = Math.sqrt(bedtimeVariance);
    const consistencyScore = Math.max(0, 100 - bedtimeStdDev); // Simple score, lower deviation is better

    // Average Quality
    const qualityMap = { 'poor': 1, 'fair': 2, 'good': 3, 'excellent': 4 };
    const totalQuality = recentLogs.reduce((sum, log) => sum + qualityMap[log.quality], 0);
    const avgQualityScore = totalQuality / recentLogs.length;
    let avgQualityText: string;
    if (avgQualityScore > 3.5) avgQualityText = "Excellent";
    else if (avgQualityScore > 2.5) avgQualityText = "Good";
    else if (avgQualityScore > 1.5) avgQualityText = "Fair";
    else avgQualityText = "Poor";

    // Average Duration
    const totalDuration = recentLogs.reduce((sum, log) => sum + calculateDuration(log.bedtime, log.wakeTime, log.date), 0);
    const avgDuration = totalDuration / recentLogs.length;
    
    return {
      consistencyScore: Math.round(consistencyScore),
      avgQuality: avgQualityText,
      avgDuration: parseFloat(avgDuration.toFixed(1)),
    }
  }, [recentLogs]);

  const handleGetTips = async () => {
    if (recentLogs.length < 2) return;
    setIsLoadingTips(true);
    setAiTips(null);
    try {
        const tips = await generateSleepTips({
            sleepLogs: recentLogs.map(l => ({...l, date: format(new Date(l.date), 'MMM d') })),
            consistencyScore: analytics.consistencyScore,
            averageQuality: analytics.avgQuality,
        });
        setAiTips(tips);
    } catch (e) {
        console.error("Failed to generate sleep tips", e);
    } finally {
        setIsLoadingTips(false);
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-3">
        {/* Left Column - Form and Logs */}
        <div className="space-y-6 md:col-span-1">
            <SleepLogForm onLogSleep={addSleepLog} />
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Recent Sleep Logs</CardTitle>
                </CardHeader>
                <CardContent>
                    {sleepLogs.length > 0 ? (
                        <ul className="space-y-3">
                            {sleepLogs.slice(0, 5).map(log => (
                                <li key={log.id} className="flex justify-between items-center text-sm">
                                    <div>
                                        <p className="font-medium">{format(new Date(log.date), "EEEE, MMM d")}</p>
                                        <p className="text-muted-foreground">{log.bedtime} - {log.wakeTime}</p>
                                    </div>
                                    <p className="capitalize text-muted-foreground">{log.quality}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-center text-muted-foreground">No sleep logged yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* Right Column - Analytics and Tips */}
        <div className="space-y-6 md:col-span-2">
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Avg Duration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold font-headline">{analytics.avgDuration}<span className="text-lg text-muted-foreground">h</span></p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Consistency</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold font-headline">{analytics.consistencyScore}<span className="text-lg text-muted-foreground">/100</span></p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Avg Quality</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold font-headline">{analytics.avgQuality}</p>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Weekly Sleep Report</CardTitle>
                </CardHeader>
                 <CardContent>
                    <WeeklySleepChart logs={recentLogs} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">AI-Powered Sleep Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    {recentLogs.length < 2 ? (
                        <Alert variant="default" className="bg-secondary/50">
                            <AlertCircle className="w-4 h-4" />
                            <AlertTitle>Not Enough Data</AlertTitle>
                            <AlertDescription>
                                Log at least two nights of sleep to get personalized tips from the AI sleep coach.
                            </AlertDescription>
                        </Alert>
                    ) : (
                       <Button onClick={handleGetTips} disabled={isLoadingTips}>
                           {isLoadingTips ? "Analyzing Your Sleep..." : "Get My Personalized Tips"}
                           {!isLoadingTips && <ArrowRight className="ml-2" />}
                       </Button>
                    )}

                    {isLoadingTips && (
                        <div className="mt-4 space-y-4">
                            <Skeleton className="w-3/4 h-6" />
                            <Skeleton className="w-full h-4" />
                            <Skeleton className="w-full h-4" />
                        </div>
                    )}

                    {aiTips && (
                        <div className="mt-6 space-y-4">
                            <Alert>
                                <Lightbulb className="w-4 h-4" />
                                <AlertTitle>Your Main Insight</AlertTitle>
                                <AlertDescription>
                                    {aiTips.mainInsight}
                                </AlertDescription>
                            </Alert>

                             <div>
                                <h4 className="font-semibold mb-2">Personalized Tips</h4>
                                <ul className="space-y-2 text-sm list-disc list-inside text-muted-foreground">
                                    {aiTips.personalizedTips.map((tip, i) => <li key={i}>{tip}</li>)}
                                </ul>
                            </div>
                            
                            <Separator />

                             <div>
                                <h4 className="font-semibold mb-2">Bedtime Reminder Suggestion</h4>
                                <p className="text-sm text-muted-foreground">{aiTips.reminderSuggestion}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
