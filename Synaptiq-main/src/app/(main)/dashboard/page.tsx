
'use client';

import { BrainCircuit, CalendarCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { StudyProgressChart } from "@/components/dashboard/study-progress-chart";
import { WeeklyActivityChart } from "@/components/dashboard/weekly-activity-chart";
import { WellnessCheckin } from "@/components/dashboard/wellness-checkin";
import Link from "next/link";
import { ClientOnly } from "@/components/client-only";
import { useAppData } from "@/context/app-data-context";
import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";

const motivationalQuotes = [
  "The secret to getting ahead is getting started.",
  "Don't watch the clock; do what it does. Keep going.",
  "The expert in anything was once a beginner.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "The future depends on what you do today."
];

export default function DashboardPage() {
  const { subjects, tasks, studyLogs } = useAppData();
  const [quote, setQuote] = useState("");

  useEffect(() => {
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  }, []);

  const dashboardStats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    
    const weeklyHours = studyLogs.reduce((acc, log) => {
        const logDate = new Date(log.date);
        const today = new Date();
        const pastWeek = new Date(today.setDate(today.getDate() - 7));
        if (logDate > pastWeek) {
            return acc + log.duration;
        }
        return acc;
    }, 0);

    const coursesInProgress = subjects.length;

    const overallScore = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      hoursStudied: weeklyHours.toFixed(1),
      tasksCompleted: completedTasks,
      coursesInProgress,
      avgScore: Math.round(overallScore),
    };
  }, [subjects, tasks, studyLogs]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="bg-page-dashboard -m-4 md:-m-6 lg:-m-8 p-4 md:p-6 lg:p-8 flex-1">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold font-headline text-gradient">Welcome Back, Dreamer!</h1>
          <p className="text-muted-foreground">Here's a snapshot of your progress today.</p>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}><StatCard title="Hours Studied (Week)" value={dashboardStats.hoursStudied} unit="h" /></motion.div>
          <motion.div variants={itemVariants}><StatCard title="Tasks Completed" value={String(dashboardStats.tasksCompleted)} /></motion.div>
          <motion.div variants={itemVariants}><StatCard title="Courses in Progress" value={String(dashboardStats.coursesInProgress)} /></motion.div>
          <motion.div variants={itemVariants}><StatCard title="Overall Progress" value={String(dashboardStats.avgScore)} unit="%" /></motion.div>
        </motion.div>

        <motion.div 
          className="grid gap-4 lg:grid-cols-7"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="col-span-1 lg:col-span-4">
            <Card>
              <CardHeader><CardTitle className="font-headline">Weekly Activity</CardTitle></CardHeader>
              <CardContent className="pl-2"><WeeklyActivityChart /></CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants} className="col-span-1 lg:col-span-3">
            <Card>
              <CardHeader><CardTitle className="font-headline">Progress by Subject</CardTitle></CardHeader>
              <CardContent><StudyProgressChart /></CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div 
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <ClientOnly><WellnessCheckin /></ClientOnly>
          </motion.div>
          <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader><CardTitle className="font-headline">Quick Access</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <QuickAccessLink href="/study-planner" icon={CalendarCheck} label="Study Planner" />
                  <QuickAccessLink href="/career" icon={BrainCircuit} label="Career Path" />
                </CardContent>
              </Card>
          </motion.div>
        </motion.div>
        
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.5}}>
          <Card className="bg-gradient-to-r from-primary to-blue-500 text-primary-foreground">
            <CardHeader>
              <CardTitle>Quote of the Day</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg italic">"{quote}"</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function QuickAccessLink({ href, icon: Icon, label }: { href: string, icon: React.ElementType, label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center p-4 text-center transition-all duration-300 rounded-lg bg-secondary/50 hover:bg-secondary hover:shadow-lg hover:-translate-y-1">
      <Icon className="w-8 h-8 text-primary" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}
